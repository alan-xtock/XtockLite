import type { Express } from "express";
import { createToastApiService } from "../toast-api";

export function registerToastRoutes(app: Express) {
  const toastApi = createToastApiService();

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