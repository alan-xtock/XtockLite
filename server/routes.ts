import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerToastRoutes } from "./routes/toast";
import { registerCsvRoutes } from "./routes/csv";
import { registerSalesRoutes } from "./routes/sales";
import { registerForecastRoutes } from "./routes/forecasts";
import { registerOrdersRoutes } from "./routes/orders";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  registerToastRoutes(app);
  registerCsvRoutes(app);
  registerSalesRoutes(app);
  registerForecastRoutes(app);
  registerOrdersRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}