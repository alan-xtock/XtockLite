import type { Express } from "express";
import { storage } from "../storage";
import { insertForecastSchema } from "@shared/schema";
import { generateForecasts } from "../forecasting";
import { z } from "zod";

const forecastRequestSchema = z.object({
  weather: z.enum(["sunny", "cloudy", "rainy"]).optional().default("cloudy")
});

export function registerForecastRoutes(app: Express) {
  app.post('/api/forecasts/generate-1day', async (req, res) => {
    try {
      console.log('1-day forecast endpoint called with:', req.body);
      const { weather = "cloudy" } = req.body;

      const salesData = await storage.getSalesData(1000);
      console.log(`Found ${salesData.length} sales records`);

      if (salesData.length === 0) {
        return res.status(400).json({
          error: 'No sales data available',
          message: 'Please upload sales data first'
        });
      }

      const itemGroups = salesData.reduce((groups: any, sale: any) => {
        if (!groups[sale.item]) groups[sale.item] = [];
        groups[sale.item].push(sale);
        return groups;
      }, {});

      console.log(`Grouped into ${Object.keys(itemGroups).length} items`);

      const forecasts = [];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      for (const [item, sales] of Object.entries(itemGroups as Record<string, any[]>)) {
        if (sales.length === 0) continue;

        const avgQuantity = sales.reduce((sum, s) => sum + s.quantity, 0) / sales.length;

        let weatherMultiplier = 1.0;
        if (weather === "sunny") weatherMultiplier = 1.2;
        else if (weather === "rainy") weatherMultiplier = 0.8;

        const predictedQuantity = Math.round(avgQuantity * weatherMultiplier);

        const forecastForStorage = {
          forecastDate: tomorrow,
          item,
          predictedQuantity,
          confidence: 75,
          currentStock: null,
          predictedSavingsInCents: 0,
          basedOnData: {
            dataPoints: sales.length,
            forecastPeriod: 1,
            reasoning: `1-day prediction for tomorrow: ${predictedQuantity} units (weather: ${weather})`,
            recommendedOrderQuantity: predictedQuantity,
            forecastType: "daily",
            weather: weather
          }
        };

        const savedForecast = await storage.createForecast(forecastForStorage);
        forecasts.push(savedForecast);
      }

      console.log(`Generated ${forecasts.length} forecasts`);

      res.json({
        success: true,
        message: `Generated ${forecasts.length} TRUE 1-day forecasts`,
        forecasts: forecasts,
        forecastPeriod: 1,
        forecastType: "daily",
        weather: weather,
        dataPointsUsed: salesData.length
      });

    } catch (error) {
      console.error('1-day forecast error:', error);
      res.status(500).json({
        error: 'Failed to generate 1-day forecasts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/forecasts/generate', async (req, res) => {
    try {
      const { weather } = forecastRequestSchema.parse(req.body);

      const salesData = await storage.getSalesData(1000);

      if (salesData.length === 0) {
        return res.status(400).json({
          error: 'No sales data available for forecasting',
          message: 'Please upload sales data first before generating forecasts'
        });
      }

      const forecastResults = await generateForecasts({
        salesData,
        weather
      });

      const forecastsToSave = [];
      for (const result of forecastResults) {
        try {
          const forecastData = {
            forecastDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            item: result.item,
            predictedQuantity: result.predictedQuantity,
            confidence: 75,
            currentStock: null,
            predictedSavingsInCents: 0,
            basedOnData: {
              dataPoints: salesData.filter(s => s.item === result.item).length,
              forecastPeriod: 1,
              reasoning: `1-day prediction for tomorrow: ${result.predictedQuantity} units (weather: ${weather})`,
              recommendedOrderQuantity: result.predictedQuantity,
              forecastType: "daily" as const,
              weather: weather
            }
          };

          console.log('About to save forecast data:', JSON.stringify(forecastData, null, 2));

          const validatedForecast = insertForecastSchema.parse(forecastData);
          console.log('Validated forecast:', JSON.stringify(validatedForecast, null, 2));
          forecastsToSave.push(validatedForecast);
        } catch (validationError) {
          console.warn(`Skipping invalid forecast for ${result.item}:`, validationError);
        }
      }

      const savedForecasts = [];
      for (const forecast of forecastsToSave) {
        console.log('Saving forecast to storage:', JSON.stringify(forecast, null, 2));
        const saved = await storage.createForecast(forecast);
        console.log('Saved forecast from storage:', JSON.stringify(saved, null, 2));
        savedForecasts.push(saved);
      }

      res.json({
        success: true,
        message: `Generated ${savedForecasts.length} next-day forecasts`,
        forecasts: savedForecasts,
        forecastPeriod: 1,
        forecastType: "daily",
        weather: weather,
        dataPointsUsed: salesData.length
      });

    } catch (error) {
      console.error('Forecast generation error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request parameters',
          details: error.issues
        });
      }

      res.status(500).json({
        error: 'Failed to generate forecasts',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  app.get('/api/forecasts', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const forecasts = await storage.getForecasts(parseInt(limit as string));

      const weather = forecasts.length > 0 && forecasts[0].basedOnData
        ? (forecasts[0].basedOnData as any)?.weather || 'cloudy'
        : 'cloudy';

      res.json({
        success: true,
        forecasts,
        weather,
        count: forecasts.length
      });
    } catch (error) {
      console.error('Get forecasts error:', error);
      res.status(500).json({ error: 'Failed to retrieve forecasts' });
    }
  });
}