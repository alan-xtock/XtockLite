import { SalesData, Forecast } from "@shared/schema";

export interface ForecastResult {
  item: string;
  predictedQuantity: number;
}

export interface ForecastRequest {
  salesData: SalesData[];
  weather?: "sunny" | "cloudy" | "rainy"; // Weather for next day
}

/**
 * Statistical forecaster using weighted block calculation
 */
function generateStatisticalForecasts(request: ForecastRequest): ForecastResult[] {
  const { salesData, weather = "cloudy" } = request;
  
  if (salesData.length === 0) {
    return [];
  }

  // Group sales data by item for analysis
  const itemGroups = groupSalesDataByItem(salesData);
  const results: ForecastResult[] = [];
  
  for (const [item, sales] of Object.entries(itemGroups)) {
    if (sales.length === 0) continue;
    
    // Sort by date (oldest first)
    sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Aggregate by date to get daily totals (multiple entries per day need to be combined)
    const dailyTotals = new Map<string, number>();
    
    for (const sale of sales) {
      const saleDate = new Date(sale.date);
      const dateKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}-${String(saleDate.getDate()).padStart(2, '0')}`;
      const existing = dailyTotals.get(dateKey) || 0;
      dailyTotals.set(dateKey, existing + sale.quantity);
    }
    
    // Get the last 30 unique days
    const sortedDates = Array.from(dailyTotals.keys()).sort();
    const last30Days = sortedDates.slice(-30);
    
    // For 1-day predictions, use available data (minimum 3 days for basic trend analysis)
    if (last30Days.length < 3) {
      console.log(`Skipping ${item}: only ${last30Days.length} days of data, need at least 3`);
      continue;
    }
    
    // For 1-day prediction: Use simple weighted average of available data
    // Give more weight to recent data for next-day prediction
    const availableDays = last30Days.length;
    let weightedSum = 0;
    let totalWeight = 0;
    
    last30Days.forEach((dateKey, index) => {
      const quantity = dailyTotals.get(dateKey) || 0;
      // Linear weighting: more recent days get higher weight
      const weight = (index + 1) / availableDays;
      weightedSum += quantity * weight;
      totalWeight += weight;
    });
    
    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Apply weather adjustment
    let weatherMultiplier = 1.0;
    if (weather === "sunny") weatherMultiplier = 1.2;
    else if (weather === "rainy") weatherMultiplier = 0.8;
    
    const prediction = Math.round((weightedAverage * weatherMultiplier) * 100) / 100; // Round to 2 decimals
    
    results.push({
      item,
      predictedQuantity: prediction
    });
  }
  
  return results;
}

/**
 * Analyzes sales data and generates statistical forecasts for purchasing decisions
 */
export async function generateForecasts(request: ForecastRequest): Promise<ForecastResult[]> {
  const { salesData, weather = "cloudy" } = request;

  console.log(`Generating forecasts for ${salesData.length} sales records with weather: ${weather}`);

  if (salesData.length === 0) {
    throw new Error("No sales data provided for forecasting");
  }

  return generateStatisticalForecasts(request);
}

/**
 * Groups sales data by item for analysis
 */
function groupSalesDataByItem(salesData: SalesData[]): Record<string, SalesData[]> {
  return salesData.reduce((groups, sale) => {
    if (!groups[sale.item]) {
      groups[sale.item] = [];
    }
    groups[sale.item].push(sale);
    return groups;
  }, {} as Record<string, SalesData[]>);
}
