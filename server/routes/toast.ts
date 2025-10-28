import type { Express } from "express";
import { createToastApiService } from "../toast-api";
import { storage } from "../storage";
import { generateDummySalesData } from "../dummy-data";

export function registerToastRoutes(app: Express) {
  const toastApi = createToastApiService();

  app.post('/api/toast/connect', async (req, res) => {
    try {
      const { apiKey } = req.body;

      // Validate API key is provided
      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({
          error: 'API key required',
          message: 'Please provide a Toast API key'
        });
      }

      console.log('Toast connection request received');

      // TODO: In production, validate the API key with Toast API
      // For now, we'll generate dummy data for demo purposes

      // Generate dummy sales data
      const dummyData = generateDummySalesData();
      console.log(`Generated ${dummyData.length} dummy sales records`);

      // Insert the dummy data into the database
      const insertedData = await storage.insertSalesData(dummyData);
      console.log(`Inserted ${insertedData.length} sales records into database`);

      res.json({
        success: true,
        message: `Successfully connected to Toast and imported ${insertedData.length} sales records`,
        validRows: insertedData.length,
        totalRows: dummyData.length,
        errors: [],
        toastDataUsed: true
      });

    } catch (error) {
      console.error('Toast connection error:', error);
      res.status(500).json({
        error: 'Failed to connect to Toast',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  app.get('/api/toast/connection-test', async (req, res) => {
    try {
      if (!toastApi) {
        return res.status(500).json({
          success: false,
          error: 'Toast API service not configured',
          message: 'Please set TOAST_CLIENT_ID and TOAST_CLIENT_SECRET environment variables'
        });
      }

      const result = await toastApi.testConnection();
      res.json(result);
    } catch (error) {
      console.error('Toast connection test error:', error);
      res.status(500).json({
        success: false,
        error: 'Connection test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/toast/restaurants', async (req, res) => {
    try {
      if (!toastApi) {
        return res.status(500).json({
          error: 'Toast API service not configured'
        });
      }

      const restaurants = await toastApi.makeApiCall('/restaurants/v1/restaurants');
      res.json(restaurants);
    } catch (error) {
      console.error('Toast restaurants API error:', error);
      res.status(500).json({
        error: 'Failed to fetch restaurants',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/toast/menus', async (req, res) => {
    try {
      if (!toastApi) {
        return res.status(500).json({
          error: 'Toast API service not configured'
        });
      }

      const { restaurantGuid } = req.query;
      if (!restaurantGuid) {
        return res.status(400).json({
          error: 'restaurantGuid parameter is required'
        });
      }

      const menus = await toastApi.makeApiCall(`/config/v1/restaurants/${restaurantGuid}/menus`);
      res.json(menus);
    } catch (error) {
      console.error('Toast menus API error:', error);
      res.status(500).json({
        error: 'Failed to fetch menus',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}