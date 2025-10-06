import type { Express } from "express";
import { createToastApiService } from "../toast-api";
import { z } from "zod";

const ordersQuerySchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  businessDate: z.string().optional(),
  pageSize: z.coerce.number().int().positive().max(1000).optional(),
  page: z.coerce.number().int().positive().optional()
});

export function registerOrdersRoutes(app: Express) {
  const toastApi = createToastApiService();

  app.get('/api/toast/orders', async (req, res) => {
    try {
      if (!toastApi) {
        return res.status(500).json({
          error: 'Toast API service not configured',
          message: 'Please set TOAST_CLIENT_ID and TOAST_CLIENT_SECRET environment variables'
        });
      }

      const validatedQuery = ordersQuerySchema.parse(req.query);

      const orders = await toastApi.getOrdersBulk(validatedQuery.restaurantId, {
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        businessDate: validatedQuery.businessDate,
        pageSize: validatedQuery.pageSize,
        page: validatedQuery.page
      });

      res.json({
        success: true,
        data: orders,
        totalCount: orders.length,
        filters: {
          restaurantId: validatedQuery.restaurantId,
          startDate: validatedQuery.startDate,
          endDate: validatedQuery.endDate,
          businessDate: validatedQuery.businessDate,
          pageSize: validatedQuery.pageSize || 100,
          page: validatedQuery.page || 1
        }
      });

    } catch (error) {
      console.error('Toast orders API error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      res.status(500).json({
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/toast/orders/summary', async (req, res) => {
    try {
      if (!toastApi) {
        return res.status(500).json({
          error: 'Toast API service not configured'
        });
      }

      const { restaurantId } = req.query;
      if (!restaurantId || typeof restaurantId !== 'string') {
        return res.status(400).json({
          error: 'restaurantId parameter is required'
        });
      }

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const orders = await toastApi.getOrdersBulk(restaurantId, {
        startDate,
        endDate,
        pageSize: 1000
      });

      let totalRevenue = 0;
      let totalOrders = orders.length;
      let totalItems = 0;
      const paymentMethods = new Map<string, number>();
      const diningOptions = new Map<string, number>();
      const popularItems = new Map<string, { count: number, revenue: number }>();

      orders.forEach((order: any) => {
        diningOptions.set(
          order.diningOption?.name || 'Unknown',
          (diningOptions.get(order.diningOption?.name || 'Unknown') || 0) + 1
        );

        order.checks?.forEach((check: any) => {
          check.payments?.forEach((payment: any) => {
            totalRevenue += payment.amount || 0;
            paymentMethods.set(
              payment.type || 'Unknown',
              (paymentMethods.get(payment.type || 'Unknown') || 0) + (payment.amount || 0)
            );
          });

          check.selections?.forEach((selection: any) => {
            totalItems += selection.quantity || 0;
            const itemName = selection.item?.name || 'Unknown';
            const revenue = (selection.quantity || 0) * (selection.unitPrice || 0);

            const existing = popularItems.get(itemName) || { count: 0, revenue: 0 };
            popularItems.set(itemName, {
              count: existing.count + (selection.quantity || 0),
              revenue: existing.revenue + revenue
            });
          });
        });
      });

      const topItems = Array.from(popularItems.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      res.json({
        success: true,
        summary: {
          totalOrders,
          totalRevenue,
          totalItems,
          averageOrderValue,
          dateRange: { startDate, endDate },
          paymentMethods: Object.fromEntries(paymentMethods),
          diningOptions: Object.fromEntries(diningOptions),
          topItems
        }
      });

    } catch (error) {
      console.error('Toast orders summary error:', error);
      res.status(500).json({
        error: 'Failed to generate orders summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}