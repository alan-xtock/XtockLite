import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sales data from CSV uploads
export const salesData = pgTable("sales_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  item: text("item").notNull(),
  quantity: integer("quantity").notNull(),
  unit: text("unit").notNull(),
  priceInCents: integer("price_in_cents").notNull(), // Store price in cents for precision
  supplier: text("supplier"),
  category: text("category"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// AI-generated forecasts
export const forecasts = pgTable("forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  forecastDate: timestamp("forecast_date").notNull(),
  item: text("item").notNull(),
  predictedQuantity: integer("predicted_quantity").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  currentStock: integer("current_stock").default(0),
  predictedSavingsInCents: integer("predicted_savings_in_cents"),
  basedOnData: json("based_on_data"), // Historical data used for prediction
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  supplier: text("supplier").notNull(),
  status: text("status", { enum: ["draft", "approved", "sent", "confirmed", "delivered"] }).default("draft"),
  items: json("items").notNull(), // Array of order items
  totalAmountInCents: integer("total_amount_in_cents").notNull(),
  forecastId: varchar("forecast_id"),
  whatsappSent: timestamp("whatsapp_sent"),
  supplierResponse: text("supplier_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  whatsappNumber: text("whatsapp_number"),
  email: text("email"),
  specialties: text("specialties").array(), // Array of produce categories
  averageResponseTime: integer("average_response_time"), // in hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertSalesDataSchema = createInsertSchema(salesData).omit({
  id: true,
  uploadedAt: true,
});

export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

// Infer types
export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = z.infer<typeof insertSalesDataSchema>;

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = z.infer<typeof insertForecastSchema>;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

// Order item schema for validation
export const orderItemSchema = z.object({
  item: z.string().min(1),
  quantity: z.number().int().positive(),
  unit: z.string().min(1),
  priceInCents: z.number().int().nonnegative(),
});

// Purchase order status enum
export const purchaseOrderStatusSchema = z.enum(["draft", "approved", "sent", "confirmed", "delivered"]);

// Enhanced insert schemas with proper validation
export const enhancedInsertPurchaseOrderSchema = insertPurchaseOrderSchema.extend({
  items: z.array(orderItemSchema),
  status: purchaseOrderStatusSchema.optional(),
});

export const enhancedInsertSalesDataSchema = insertSalesDataSchema.extend({
  priceInCents: z.number().int().nonnegative(),
});

// Additional types for frontend
export interface OrderItem {
  item: string;
  quantity: number;
  unit: string;
  priceInCents: number;
}

export interface ForecastItem {
  item: string;
  currentStock: number;
  predicted: number;
  confidence: number;
  savingsInCents: number;
}

export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatusSchema>;