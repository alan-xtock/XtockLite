import {
  type SalesData,
  type InsertSalesData,
  type Forecast,
  type InsertForecast,
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type Supplier,
  type InsertSupplier,
  type OrderItem,
  type PurchaseOrderStatus,
  enhancedInsertPurchaseOrderSchema,
  enhancedInsertSalesDataSchema,
  purchaseOrderStatusSchema,
  salesData,
  forecasts,
  purchaseOrders,
  suppliers
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { desc, eq, gte, lte, and } from "drizzle-orm";

// Storage interface for XtockLite
export interface IStorage {
  // Sales data operations
  insertSalesData(data: InsertSalesData[]): Promise<SalesData[]>;
  getSalesData(limit?: number): Promise<SalesData[]>;
  getSalesDataByDateRange(startDate: Date, endDate: Date): Promise<SalesData[]>;
  getSalesDataByItem(item: string): Promise<SalesData[]>;

  // Forecast operations
  createForecast(forecast: InsertForecast): Promise<Forecast>;
  getForecasts(limit?: number): Promise<Forecast[]>;
  getForecastsByDate(date: Date): Promise<Forecast[]>;
  getLatestForecast(): Promise<Forecast | undefined>;

  // Purchase order operations
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  getPurchaseOrders(limit?: number): Promise<PurchaseOrder[]>;
  getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined>;
  updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder>;
  markOrderSentViaWhatsApp(id: string): Promise<PurchaseOrder>;
  setSupplierResponse(id: string, response: string): Promise<PurchaseOrder>;

  // Supplier operations
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  getSuppliers(): Promise<Supplier[]>;
  getSupplierByName(name: string): Promise<Supplier | undefined>;
  updateSupplierResponseTime(supplierId: string, responseTimeHours: number): Promise<Supplier>;
}

export class MemStorage implements IStorage {
  private salesData: Map<string, SalesData>;
  private forecasts: Map<string, Forecast>;
  private purchaseOrders: Map<string, PurchaseOrder>;
  private suppliers: Map<string, Supplier>;
  private initialized: boolean = false;

  constructor() {
    this.salesData = new Map();
    this.forecasts = new Map();
    this.purchaseOrders = new Map();
    this.suppliers = new Map();
    this.initialized = true;
  }


  // Sales data operations
  async insertSalesData(data: InsertSalesData[]): Promise<SalesData[]> {
    const results: SalesData[] = [];
    
    for (const item of data) {
      // Validate the data
      const validatedData = enhancedInsertSalesDataSchema.parse(item);
      
      const id = randomUUID();
      const salesRecord: SalesData = {
        ...validatedData,
        id,
        supplier: validatedData.supplier || null,
        category: validatedData.category || null,
        uploadedAt: new Date(),
      };
      this.salesData.set(id, salesRecord);
      results.push(salesRecord);
    }
    
    return results;
  }

  async getSalesData(limit = 100): Promise<SalesData[]> {
    const data = Array.from(this.salesData.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return data.slice(0, limit);
  }

  async getSalesDataByDateRange(startDate: Date, endDate: Date): Promise<SalesData[]> {
    return Array.from(this.salesData.values())
      .filter(data => {
        const date = new Date(data.date);
        return date >= startDate && date <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSalesDataByItem(item: string): Promise<SalesData[]> {
    return Array.from(this.salesData.values())
      .filter(data => data.item.toLowerCase().includes(item.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Forecast operations
  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const id = randomUUID();
    const forecastRecord: Forecast = {
      ...forecast,
      id,
      currentStock: forecast.currentStock || null,
      predictedSavingsInCents: forecast.predictedSavingsInCents || null,
      basedOnData: forecast.basedOnData || null,
      createdAt: new Date(),
    };
    this.forecasts.set(id, forecastRecord);
    return forecastRecord;
  }

  async getForecasts(limit = 50): Promise<Forecast[]> {
    const forecasts = Array.from(this.forecasts.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return forecasts.slice(0, limit);
  }

  async getForecastsByDate(date: Date): Promise<Forecast[]> {
    const targetDate = date.toISOString().split('T')[0];
    return Array.from(this.forecasts.values())
      .filter(forecast => {
        const forecastDate = new Date(forecast.forecastDate).toISOString().split('T')[0];
        return forecastDate === targetDate;
      })
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getLatestForecast(): Promise<Forecast | undefined> {
    const forecasts = Array.from(this.forecasts.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return forecasts[0];
  }

  // Purchase order operations
  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> {
    // Validate the order data
    const validatedOrder = enhancedInsertPurchaseOrderSchema.parse(order);
    
    const id = randomUUID();
    const orderNumber = `PO-${new Date().getFullYear()}-${String(this.purchaseOrders.size + 1).padStart(3, '0')}`;
    
    // Calculate total amount from items if not provided
    const items = validatedOrder.items as OrderItem[];
    const calculatedTotal = items.reduce((sum, item) => sum + (item.priceInCents * item.quantity), 0);
    
    const purchaseOrder: PurchaseOrder = {
      ...validatedOrder,
      id,
      orderNumber,
      status: validatedOrder.status || "draft",
      items: validatedOrder.items,
      totalAmountInCents: validatedOrder.totalAmountInCents || calculatedTotal,
      forecastId: validatedOrder.forecastId || null,
      whatsappSent: null,
      supplierResponse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  async getPurchaseOrders(limit = 50): Promise<PurchaseOrder[]> {
    const orders = Array.from(this.purchaseOrders.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    return orders.slice(0, limit);
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
    // Validate status
    const validatedStatus = purchaseOrderStatusSchema.parse(status);
    
    const order = this.purchaseOrders.get(id);
    if (!order) {
      throw new Error(`Purchase order ${id} not found`);
    }

    const updatedOrder: PurchaseOrder = {
      ...order,
      status: validatedStatus,
      updatedAt: new Date(),
    };

    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async markOrderSentViaWhatsApp(id: string): Promise<PurchaseOrder> {
    const order = this.purchaseOrders.get(id);
    if (!order) {
      throw new Error(`Purchase order ${id} not found`);
    }

    const updatedOrder: PurchaseOrder = {
      ...order,
      status: "sent",
      whatsappSent: new Date(),
      updatedAt: new Date(),
    };

    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async setSupplierResponse(id: string, response: string): Promise<PurchaseOrder> {
    const order = this.purchaseOrders.get(id);
    if (!order) {
      throw new Error(`Purchase order ${id} not found`);
    }

    const updatedOrder: PurchaseOrder = {
      ...order,
      supplierResponse: response,
      updatedAt: new Date(),
    };

    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Supplier operations
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplierRecord: Supplier = {
      ...supplier,
      id,
      whatsappNumber: supplier.whatsappNumber || null,
      email: supplier.email || null,
      specialties: supplier.specialties || [],
      averageResponseTime: supplier.averageResponseTime || null,
      isActive: supplier.isActive !== undefined ? supplier.isActive : true,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplierRecord);
    return supplierRecord;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values())
      .filter(supplier => supplier.isActive === true)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getSupplierByName(name: string): Promise<Supplier | undefined> {
    return Array.from(this.suppliers.values())
      .find(supplier => supplier.name.toLowerCase() === name.toLowerCase());
  }

  async updateSupplierResponseTime(supplierId: string, responseTimeHours: number): Promise<Supplier> {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    const updatedSupplier: Supplier = {
      ...supplier,
      averageResponseTime: responseTimeHours,
    };

    this.suppliers.set(supplierId, updatedSupplier);
    return updatedSupplier;
  }
}

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

// Use database storage when DATABASE_URL is available, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();