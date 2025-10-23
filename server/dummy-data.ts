import type { InsertSalesData } from "@shared/schema";

export function generateDummySalesData(): InsertSalesData[] {
  const items = [
    { name: "Crispy Brussels Sprouts", unit: "orders", basePrice: 1400, supplier: "Local Restaurant Supply", category: "Appetizers" },
    { name: "Fried Calamari", unit: "orders", basePrice: 1400, supplier: "Seafood Distributors Inc", category: "Appetizers" },
    { name: "Spinach Artichoke Dip", unit: "orders", basePrice: 1400, supplier: "Local Restaurant Supply", category: "Appetizers" },
    { name: "House Burger", unit: "orders", basePrice: 1400, supplier: "Premium Meat Co", category: "Entrees" },
    { name: "Grilled Salmon", unit: "orders", basePrice: 1400, supplier: "Seafood Distributors Inc", category: "Entrees" },
    { name: "Ribeye Steak", unit: "orders", basePrice: 1400, supplier: "Premium Meat Co", category: "Entrees" },
    { name: "Fried Chicken Sandwich", unit: "orders", basePrice: 1400, supplier: "Premium Meat Co", category: "Entrees" },
    { name: "Braised Short Rib", unit: "orders", basePrice: 1400, supplier: "Premium Meat Co", category: "Entrees" },
    { name: "Penne alla Vodka", unit: "orders", basePrice: 1400, supplier: "Italian Imports Ltd", category: "Entrees" },
    { name: "Chocolate Lava Cake", unit: "orders", basePrice: 1400, supplier: "Sweet Treats Bakery", category: "Desserts" }
  ];

  const dummyData: InsertSalesData[] = [];

  // Generate data for the last 30 days
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    // Generate 5-12 random sales per day (restaurant orders)
    const salesPerDay = Math.floor(Math.random() * 8) + 5;

    for (let i = 0; i < salesPerDay; i++) {
      const item = items[Math.floor(Math.random() * items.length)];

      // Add some randomness to quantities (orders per day)
      const baseQuantity = Math.floor(Math.random() * 35) + 15; // 15-50 orders per item per day
      const priceVariation = 0.95 + Math.random() * 0.1; // ±5% price variation (menu prices are more stable)

      dummyData.push({
        date,
        item: item.name,
        quantity: baseQuantity,
        unit: item.unit,
        priceInCents: Math.round(item.basePrice * priceVariation),
        supplier: item.supplier,
        category: item.category
      });
    }
  }

  // Sort by date (newest first)
  return dummyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}