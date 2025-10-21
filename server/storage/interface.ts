import type {
  SalesData,
  InsertSalesData,
  Forecast,
  InsertForecast,
  PurchaseOrder,
  InsertPurchaseOrder,
  Supplier,
  InsertSupplier,
  PurchaseOrderStatus
} from "@shared/schema";

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
  clearForecasts(): Promise<void>;

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