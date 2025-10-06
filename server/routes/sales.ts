import type { Express } from "express";
import { storage } from "../storage";

export function registerSalesRoutes(app: Express) {
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

  app.get('/api/sales-data/summary', async (req, res) => {
    try {
      const allData = await storage.getSalesData(1000);

      if (allData.length === 0) {
        return res.json({
          totalRecords: 0,
          totalValue: 0,
          dateRange: null,
          topItems: [],
          topSuppliers: []
        });
      }

      const totalValue = allData.reduce((sum, record) => sum + (record.priceInCents * record.quantity), 0);

      const dates = allData.map(record => new Date(record.date).getTime()).sort();
      const dateRange = {
        start: new Date(dates[0]),
        end: new Date(dates[dates.length - 1])
      };

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
}