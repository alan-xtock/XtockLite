import type { Express } from "express";
import multer from "multer";
import Papa from "papaparse";
import { storage } from "../storage";
import { enhancedInsertSalesDataSchema } from "@shared/schema";
import { z } from "zod";
import { csvColumnSchema, parseCsvRow, validateRequiredFields } from "./csv-utils";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

export function registerCsvRoutes(app: Express) {
  app.post('/api/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csvContent = req.file.buffer.toString('utf-8');

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

      const validateOnly = req.query.validateOnly === 'true';
      const rejectOnError = req.query.rejectOnError === 'true';

      const validatedData = [];
      const errors = [];

      for (let i = 0; i < parseResult.data.length; i++) {
        try {
          const row = parseResult.data[i];
          const { data: normalizedRow, fieldMappings } = parseCsvRow(row);

          const fieldErrors = validateRequiredFields(normalizedRow, fieldMappings);
          if (fieldErrors.length > 0) {
            errors.push({
              row: i + 1,
              errors: fieldErrors,
              originalData: row
            });
            continue;
          }

          const validatedRow = csvColumnSchema.parse(normalizedRow);

          const salesDataRow = {
            date: validatedRow.date,
            item: validatedRow.item,
            quantity: validatedRow.quantity,
            unit: validatedRow.unit,
            priceInCents: validatedRow.price,
            supplier: validatedRow.supplier || null,
            category: validatedRow.category || null,
          };

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

      if (rejectOnError && errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          message: `${errors.length} rows contain errors. Use rejectOnError=false to process valid rows only.`,
          errors: errors.slice(0, 10),
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
}