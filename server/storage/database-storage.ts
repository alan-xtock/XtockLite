import {
  type SalesData,
  type InsertSalesData,
  type Forecast,
  type InsertForecast,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type Supplier,
  type InsertSupplier,
  type PurchaseOrderStatus,
  salesData,
  forecasts,
  purchaseOrders,
  suppliers
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { desc, eq, gte, lte, and } from "drizzle-orm";
import type { IStorage } from "./interface";

// Database storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required for DatabaseStorage");
    }

    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client, {
      schema: { salesData, forecasts, purchaseOrders, suppliers }
    });
  }

  // Sales data operations
  async insertSalesData(data: InsertSalesData[]): Promise<SalesData[]> {
    const result = await this.db.insert(salesData).values(data).returning();
    return result;
  }

  async getSalesData(limit: number = 100): Promise<SalesData[]> {
    const result = await this.db
      .select()
      .from(salesData)
      .orderBy(desc(salesData.date))
      .limit(limit);
    return result;
  }

  async getSalesDataByDateRange(startDate: Date, endDate: Date): Promise<SalesData[]> {
    const result = await this.db
      .select()
      .from(salesData)
      .where(and(gte(salesData.date, startDate), lte(salesData.date, endDate)))
      .orderBy(desc(salesData.date));
    return result;
  }

  async getSalesDataByItem(item: string): Promise<SalesData[]> {
    const result = await this.db
      .select()
      .from(salesData)
      .where(eq(salesData.item, item))
      .orderBy(desc(salesData.date));
    return result;
  }

  // Forecast operations
  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const result = await this.db.insert(forecasts).values(forecast).returning();
    return result[0];
  }

  async getForecasts(limit: number = 50): Promise<Forecast[]> {
    const result = await this.db
      .select()
      .from(forecasts)
      .orderBy(desc(forecasts.createdAt))
      .limit(limit);
    return result;
  }

  async getForecastsByDate(date: Date): Promise<Forecast[]> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const result = await this.db
      .select()
      .from(forecasts)
      .where(and(gte(forecasts.forecastDate, startOfDay), lte(forecasts.forecastDate, endOfDay)))
      .orderBy(desc(forecasts.createdAt));
    return result;
  }

  async getLatestForecast(): Promise<Forecast | undefined> {
    const result = await this.db
      .select()
      .from(forecasts)
      .orderBy(desc(forecasts.createdAt))
      .limit(1);
    return result[0];
  }

  async clearForecasts(): Promise<void> {
    await this.db.delete(forecasts);
  }

  // Purchase order operations
  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const result = await this.db.insert(purchaseOrders).values(order).returning();
    return result[0];
  }

  async getPurchaseOrders(limit: number = 50): Promise<PurchaseOrder[]> {
    const result = await this.db
      .select()
      .from(purchaseOrders)
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(limit);
    return result;
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    const result = await this.db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);
    return result[0];
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    const result = await this.db
      .update(purchaseOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return result[0];
  }

  async markOrderSentViaWhatsApp(id: string): Promise<PurchaseOrder> {
    const result = await this.db
      .update(purchaseOrders)
      .set({ whatsappSent: new Date(), updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return result[0];
  }

  async setSupplierResponse(id: string, response: string): Promise<PurchaseOrder> {
    const result = await this.db
      .update(purchaseOrders)
      .set({ supplierResponse: response, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return result[0];
  }

  // Supplier operations
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const result = await this.db.insert(suppliers).values(supplier).returning();
    return result[0];
  }

  async getSuppliers(): Promise<Supplier[]> {
    const result = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.isActive, true))
      .orderBy(suppliers.name);
    return result;
  }

  async getSupplierByName(name: string): Promise<Supplier | undefined> {
    const result = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, name))
      .limit(1);
    return result[0];
  }

  async updateSupplierResponseTime(supplierId: string, responseTimeHours: number): Promise<Supplier> {
    const result = await this.db
      .update(suppliers)
      .set({ averageResponseTime: responseTimeHours })
      .where(eq(suppliers.id, supplierId))
      .returning();
    return result[0];
  }
}