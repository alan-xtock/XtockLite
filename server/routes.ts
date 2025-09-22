import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import Papa from "papaparse";
import { storage } from "./storage";
import { enhancedInsertSalesDataSchema, insertForecastSchema } from "@shared/schema";
import { generateForecasts, ForecastResult } from "./forecasting";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Utility functions for parsing
function sanitizeNumericString(value: string): string {
  // Remove currency symbols, commas, and extra spaces
  return value.replace(/[$£€¥,\s]/g, '').trim();
}

function parseQuantity(value: string): number {
  const sanitized = sanitizeNumericString(value);
  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    throw new Error(`Invalid quantity: ${value}`);
  }
  return parsed;
}

function parsePrice(value: string): number {
  const sanitized = sanitizeNumericString(value);
  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid price: ${value}`);
  }
  return Math.round(parsed * 100); // Convert to cents
}

// CSV column mapping and validation
const csvColumnSchema = z.object({
  date: z.string().pipe(z.coerce.date().refine(d => !isNaN(d.getTime()), "Invalid date format")),
  item: z.string().min(1, "Item name is required"),
  quantity: z.string().transform(parseQuantity),
  unit: z.string().optional().default("units"), // Default unit if not provided
  price: z.string().optional().default("1.00").transform(parsePrice), // Default $1.00 if no price
  supplier: z.string().optional(),
  category: z.string().optional(),
});

function parseCsvRow(row: any): { data: any; fieldMappings: Record<string, string> } {
  // Handle different possible column names (case insensitive)
  const normalizedRow: any = {};
  const fieldMappings: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.toLowerCase().trim();
    
    if (lowerKey.includes('date') || lowerKey.includes('timestamp')) {
      normalizedRow.date = value;
      fieldMappings.date = key;
    } else if (lowerKey.includes('supplier') || lowerKey.includes('vendor')) {
      // Check supplier/vendor first to avoid "Supplier Name" being mapped as item
      normalizedRow.supplier = value;
      fieldMappings.supplier = key;
    } else if (lowerKey.includes('item') || lowerKey.includes('product') || lowerKey.includes('category') || (lowerKey === 'name' || lowerKey.endsWith(' name'))) {
      // More specific name matching to avoid conflicts, including item_category
      normalizedRow.item = value;
      fieldMappings.item = key;
    } else if (lowerKey.includes('quantity') || lowerKey.includes('qty')) {
      // Exclude 'amount' from quantity mapping to avoid confusion with monetary amounts
      normalizedRow.quantity = value;
      fieldMappings.quantity = key;
    } else if (lowerKey.includes('unit') || lowerKey.includes('uom')) {
      normalizedRow.unit = value;
      fieldMappings.unit = key;
    } else if (lowerKey.includes('price') || lowerKey.includes('cost') || (lowerKey.includes('amount') && !lowerKey.includes('quantity'))) {
      normalizedRow.price = value;
      fieldMappings.price = key;
    } else if (lowerKey.includes('category') || lowerKey.includes('type')) {
      normalizedRow.category = value;
      fieldMappings.category = key;
    }
  }
  
  return { data: normalizedRow, fieldMappings };
}

function validateRequiredFields(data: any, fieldMappings: Record<string, string>): string[] {
  const errors: string[] = [];
  const required = ['date', 'item', 'quantity'];
  const optional = ['unit', 'price'];
  
  for (const field of required) {
    if (!data[field]) {
      const suggestion = field === 'quantity' ? 'qty/quantity' : field === 'item' ? 'item/product/category' : field === 'date' ? 'date/timestamp' : field;
      errors.push(`Missing required field '${field}' (expected header: ${suggestion})`);
    }
  }
  
  // Add default values for missing optional fields
  if (!data.unit) {
    data.unit = "units";
    console.log("No unit column found - using default 'units'");
  }
  if (!data.price) {
    data.price = "1.00";
    console.log("No price column found - using default $1.00 per unit");
  }
  
  return errors;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CSV Upload endpoint
  app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      
      // Parse CSV
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({
          error: 'CSV parsing failed',
          details: parseResult.errors
        });
      }

      // Check for dry-run mode
      const validateOnly = req.query.validateOnly === 'true';
      const rejectOnError = req.query.rejectOnError === 'true';
      
      // Validate and transform data
      const validatedData = [];
      const errors = [];

      for (let i = 0; i < parseResult.data.length; i++) {
        try {
          const row = parseResult.data[i];
          const { data: normalizedRow, fieldMappings } = parseCsvRow(row);
          
          // Check for required fields
          const fieldErrors = validateRequiredFields(normalizedRow, fieldMappings);
          if (fieldErrors.length > 0) {
            errors.push({
              row: i + 1,
              errors: fieldErrors,
              originalData: row
            });
            continue;
          }
          
          // Validate with schema
          const validatedRow = csvColumnSchema.parse(normalizedRow);
          
          // Convert to our data format
          const salesDataRow = {
            date: validatedRow.date,
            item: validatedRow.item,
            quantity: validatedRow.quantity,
            unit: validatedRow.unit,
            priceInCents: validatedRow.price,
            supplier: validatedRow.supplier || null,
            category: validatedRow.category || null,
          };

          // Final validation with our schema
          enhancedInsertSalesDataSchema.parse(salesDataRow);
          validatedData.push(salesDataRow);
          
        } catch (error) {
          const errorDetails = [];
          
          if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
              errorDetails.push(`${issue.path.join('.')}: ${issue.message}`);
            }
          } else {
            errorDetails.push(error instanceof Error ? error.message : 'Invalid data format');
          }
          
          errors.push({
            row: i + 1,
            errors: errorDetails,
            originalData: parseResult.data[i]
          });
        }
      }

      // If rejectOnError is true and there are errors, don't proceed
      if (rejectOnError && errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `${errors.length} rows contain errors. Use rejectOnError=false to process valid rows only.`,
          errors: errors.slice(0, 10), // Return first 10 errors
          totalErrors: errors.length
        });
      }

      if (errors.length > 0 && validatedData.length === 0) {
        return res.status(400).json({
          error: 'No valid rows found in CSV',
          errors: errors.slice(0, 10),
          totalErrors: errors.length
        });
      }
      
      // If this is a validation-only request, return results without inserting
      if (validateOnly) {
        return res.json({
          success: true,
          validationOnly: true,
          message: `Validation complete: ${validatedData.length} valid rows, ${errors.length} errors`,
          totalRows: parseResult.data.length,
          validRows: validatedData.length,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
          totalErrors: errors.length
        });
      }

      // Insert valid data into storage
      const insertedData = await storage.insertSalesData(validatedData);

      res.json({
        success: true,
        message: `Successfully processed ${insertedData.length} rows`,
        totalRows: parseResult.data.length,
        validRows: insertedData.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        totalErrors: errors.length
      });

    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sales data
  app.get('/api/sales-data', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const data = await storage.getSalesData(limit);
      res.json(data);
    } catch (error) {
      console.error('Get sales data error:', error);
      res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  });

  // Get sales data by date range
  app.get('/api/sales-data/range', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      const data = await storage.getSalesDataByDateRange(start, end);
      res.json(data);
    } catch (error) {
      console.error('Get sales data by range error:', error);
      res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  });

  // Get sales data summary/stats
  app.get('/api/sales-data/summary', async (req, res) => {
    try {
      const allData = await storage.getSalesData(1000); // Get more data for summary
      
      if (allData.length === 0) {
        return res.json({
          totalRecords: 0,
          totalValue: 0,
          dateRange: null,
          topItems: [],
          topSuppliers: []
        });
      }

      // Calculate summary statistics
      const totalValue = allData.reduce((sum, record) => sum + (record.priceInCents * record.quantity), 0);
      
      const dates = allData.map(record => new Date(record.date).getTime()).sort();
      const dateRange = {
        start: new Date(dates[0]),
        end: new Date(dates[dates.length - 1])
      };

      // Top items by total value
      const itemStats = new Map<string, { quantity: number, value: number }>();
      allData.forEach(record => {
        const existing = itemStats.get(record.item) || { quantity: 0, value: 0 };
        existing.quantity += record.quantity;
        existing.value += record.priceInCents * record.quantity;
        itemStats.set(record.item, existing);
      });

      const topItems = Array.from(itemStats.entries())
        .map(([item, stats]) => ({ item, ...stats }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Top suppliers by total value
      const supplierStats = new Map<string, { orders: number, value: number }>();
      allData.forEach(record => {
        const supplier = record.supplier || 'Unknown';
        const existing = supplierStats.get(supplier) || { orders: 0, value: 0 };
        existing.orders += 1;
        existing.value += record.priceInCents * record.quantity;
        supplierStats.set(supplier, existing);
      });

      const topSuppliers = Array.from(supplierStats.entries())
        .map(([supplier, stats]) => ({ supplier, ...stats }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      res.json({
        totalRecords: allData.length,
        totalValue,
        dateRange,
        topItems,
        topSuppliers
      });
    } catch (error) {
      console.error('Get sales summary error:', error);
      res.status(500).json({ error: 'Failed to generate sales summary' });
    }
  });

  // Request validation schema
  const forecastRequestSchema = z.object({
    weather: z.enum(["sunny", "cloudy", "rainy"]).optional().default("cloudy")
  });

  // TRUE 1-day forecast generation endpoint (bypasses integrations)
  app.post('/api/forecasts/generate-1day', async (req, res) => {
    try {
      console.log('1-day forecast endpoint called with:', req.body);
      const { weather = "cloudy" } = req.body;
      
      // Get recent sales data
      const salesData = await storage.getSalesData(1000);
      console.log(`Found ${salesData.length} sales records`);
      
      if (salesData.length === 0) {
        return res.status(400).json({ 
          error: 'No sales data available',
          message: 'Please upload sales data first'
        });
      }

      // Generate simple 1-day predictions
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
        
        // Simple average of recent sales  
        const avgQuantity = sales.reduce((sum, s) => sum + s.quantity, 0) / sales.length;
        
        // Apply weather adjustment
        let weatherMultiplier = 1.0;
        if (weather === "sunny") weatherMultiplier = 1.2;
        else if (weather === "rainy") weatherMultiplier = 0.8;
        
        const predictedQuantity = Math.round(avgQuantity * weatherMultiplier);
        
        // Create forecast compatible with storage schema
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
        
        // Save to storage (this adds id and createdAt)
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

  // Original endpoint (may be overridden by integration)
  app.post('/api/forecasts/generate', async (req, res) => {
    try {
      // Validate request body
      const { weather } = forecastRequestSchema.parse(req.body);

      // Get recent sales data
      const salesData = await storage.getSalesData(1000); // Get last 1000 records
      
      if (salesData.length === 0) {
        return res.status(400).json({ 
          error: 'No sales data available for forecasting',
          message: 'Please upload sales data first before generating forecasts'
        });
      }

      // Generate AI forecasts
      const forecastResults = await generateForecasts({
        salesData,
        weather
      });

      // Convert forecast results to database format with validation
      const forecastsToSave = [];
      for (const result of forecastResults) {
        try {
          const forecastData = {
            forecastDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
            item: result.item,
            predictedQuantity: result.predictedQuantity,
            confidence: 75, // Default confidence for simplified system
            currentStock: null, // Unknown inventory
            predictedSavingsInCents: 0, // No savings calculation in simplified system
            basedOnData: { 
              dataPoints: salesData.filter(s => s.item === result.item).length,
              forecastPeriod: 1, // FORCE 1-day prediction
              reasoning: `1-day prediction for tomorrow: ${result.predictedQuantity} units (weather: ${weather})`,
              recommendedOrderQuantity: result.predictedQuantity,
              forecastType: "daily" as const, // FORCE daily type
              weather: weather
            }
          };
          
          console.log('About to save forecast data:', JSON.stringify(forecastData, null, 2));
          
          // Validate with schema
          const validatedForecast = insertForecastSchema.parse(forecastData);
          console.log('Validated forecast:', JSON.stringify(validatedForecast, null, 2));
          forecastsToSave.push(validatedForecast);
        } catch (validationError) {
          console.warn(`Skipping invalid forecast for ${result.item}:`, validationError);
        }
      }

      // Save forecasts to storage
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
        forecastPeriod: 1, // 1-day predictions  
        forecastType: "daily", // Override any integration values
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

  // Get forecasts endpoint
  app.get('/api/forecasts', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const forecasts = await storage.getForecasts(parseInt(limit as string));
      
      // Extract weather from most recent forecast's basedOnData
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

  const httpServer = createServer(app);
  return httpServer;
}
