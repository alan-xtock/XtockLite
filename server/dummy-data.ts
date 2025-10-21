import type { InsertSalesData } from "@shared/schema";

export function generateDummySalesData(): InsertSalesData[] {
  const items = [
    { name: "Tomatoes", unit: "lbs", basePrice: 250, supplier: "Fresh Farms Co" },
    { name: "Lettuce", unit: "heads", basePrice: 125, supplier: "Green Valley" },
    { name: "Onions", unit: "lbs", basePrice: 180, supplier: "Fresh Farms Co" },
    { name: "Carrots", unit: "lbs", basePrice: 150, supplier: "Organic Gardens" },
    { name: "Bell Peppers", unit: "lbs", basePrice: 300, supplier: "Green Valley" },
    { name: "Cucumbers", unit: "lbs", basePrice: 200, supplier: "Fresh Farms Co" },
    { name: "Spinach", unit: "lbs", basePrice: 350, supplier: "Organic Gardens" },
    { name: "Broccoli", unit: "lbs", basePrice: 280, supplier: "Green Valley" },
    { name: "Mushrooms", unit: "lbs", basePrice: 450, supplier: "Specialty Produce" },
    { name: "Avocados", unit: "each", basePrice: 75, supplier: "Specialty Produce" }
  ];

  const categories = ["Vegetables", "Fruits", "Leafy Greens"];
  const dummyData: InsertSalesData[] = [];

  // Generate data for the last 30 days
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);

    // Generate 3-8 random sales per day
    const salesPerDay = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < salesPerDay; i++) {
      const item = items[Math.floor(Math.random() * items.length)];

      // Add some randomness to quantities and prices
      const baseQuantity = Math.floor(Math.random() * 20) + 5; // 5-25 units
      const priceVariation = 0.8 + Math.random() * 0.4; // ±20% price variation

      dummyData.push({
        date,
        item: item.name,
        quantity: baseQuantity,
        unit: item.unit,
        priceInCents: Math.round(item.basePrice * priceVariation),
        supplier: item.supplier,
        category: categories[Math.floor(Math.random() * categories.length)]
      });
    }
  }

  // Sort by date (newest first)
  return dummyData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}