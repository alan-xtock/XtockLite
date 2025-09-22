import OpenAI from "openai";
import { SalesData, Forecast } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not found. AI forecasting will not work.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ForecastResult {
  item: string;
  predictedQuantity: number;
}

export interface ForecastRequest {
  salesData: SalesData[];
  weather?: "sunny" | "cloudy" | "rainy"; // Weather for next day
}

/**
 * Statistical fallback forecaster using weighted block calculation
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
    
    // Only predict if we have at least 30 unique days of data
    if (last30Days.length < 30) {
      continue;
    }
    
    // Split into 4 blocks with correct weights (oldest → newest)
    const block1 = last30Days.slice(0, 7);   // Days 1-7 (oldest) → 50% weight
    const block2 = last30Days.slice(7, 14);  // Days 8-14 → 30% weight
    const block3 = last30Days.slice(14, 21); // Days 15-21 → 10% weight
    const block4 = last30Days.slice(21, 30); // Days 22-30 (most recent) → 10% weight
    
    // Calculate average quantity for each block
    const avg1 = block1.reduce((sum, dateKey) => sum + (dailyTotals.get(dateKey) || 0), 0) / block1.length;
    const avg2 = block2.reduce((sum, dateKey) => sum + (dailyTotals.get(dateKey) || 0), 0) / block2.length;
    const avg3 = block3.reduce((sum, dateKey) => sum + (dailyTotals.get(dateKey) || 0), 0) / block3.length;
    const avg4 = block4.reduce((sum, dateKey) => sum + (dailyTotals.get(dateKey) || 0), 0) / block4.length;
    
    // Apply weights and sum: 50% (oldest) + 30% + 10% + 10% (newest)
    const weightedAverage = (avg1 * 0.5) + (avg2 * 0.3) + (avg3 * 0.1) + (avg4 * 0.1);
    
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
 * Analyzes sales data and generates AI-powered forecasts for purchasing decisions
 */
export async function generateForecasts(request: ForecastRequest): Promise<ForecastResult[]> {
  const { salesData, weather = "cloudy" } = request;
  
  if (salesData.length === 0) {
    throw new Error("No sales data provided for forecasting");
  }

  // Group sales data by item for analysis
  const itemGroups = groupSalesDataByItem(salesData);
  
  // Prepare data summary for AI analysis
  const dataSummary = prepareSalesDataSummary(itemGroups);
  
  // Check if we can use AI forecasting
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not found. Using statistical fallback forecasting.");
    return generateStatisticalForecasts(request);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI forecasting agent for restaurant inventory.

Task: Predict the next-day sales quantity for each item based on the past 30 days of sales.

Rules:
- Input data format: A table with columns [Date, Item, Qty].
- For each item, use only the last 30 days of sales.
- Split the 30 days into 4 blocks:
   • Days 1–7 (oldest) → 50% weight
   • Days 8–14 → 30% weight
   • Days 15–21 → 10% weight
   • Days 22–30 (most recent) → 10% weight
- Take the average Qty within each block, then apply the weights and sum them.
- After computing the weighted average, adjust by weather:
   • Sunny → multiply by 1.2
   • Cloudy → multiply by 1.0
   • Rainy → multiply by 0.8
- Round the result to 2 decimals.
- Output: "Predicted sales for [Item] tomorrow: [Number]" for each item in the dataset.

If data is missing for any days, skip those days when calculating the block averages.
Only predict if there are at least 30 days of data available for the item.

Respond with JSON in this exact format:
{
  "predictions": [
    {
      "item": "string",
      "predictedQuantity": number,
      "message": "Predicted sales for [Item] tomorrow: [Number]"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Here is the sales data for analysis:

${dataSummary}

Weather for tomorrow: ${weather}

Please analyze and provide next-day quantity predictions for each item following the weighted block calculation rules.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.predictions || !Array.isArray(result.predictions)) {
      console.warn("Invalid AI response format, falling back to statistical forecasting");
      return generateStatisticalForecasts(request);
    }

    return result.predictions.map((prediction: any) => ({
      item: prediction.item,
      predictedQuantity: Math.max(0, Math.round((prediction.predictedQuantity || 0) * 100) / 100)
    }));

  } catch (error) {
    console.error("AI forecasting failed, using statistical fallback:", error);
    
    // Check if it's a specific OpenAI error
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.error("OpenAI API authentication failed. Check OPENAI_API_KEY.");
      } else if (error.message.includes('429')) {
        console.error("OpenAI API rate limit exceeded. Using fallback forecasting.");
      } else if (error.message.includes('5')) {
        console.error("OpenAI API server error. Using fallback forecasting.");
      }
    }
    
    // Always fall back to statistical forecasting instead of throwing
    return generateStatisticalForecasts(request);
  }
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

/**
 * Prepares a structured summary of sales data for restaurant inventory AI analysis
 */
function prepareSalesDataSummary(itemGroups: Record<string, SalesData[]>): string {
  const summaryLines = [];
  
  summaryLines.push(`RESTAURANT INVENTORY SALES DATA:`);
  summaryLines.push(`| Date | Item | Qty |`);
  summaryLines.push(`|------|------|-----|`);
  
  // Create table format for AI analysis
  const allSales: Array<{date: string, item: string, quantity: number}> = [];
  
  for (const [item, sales] of Object.entries(itemGroups)) {
    for (const sale of sales) {
      allSales.push({
        date: sale.date instanceof Date ? sale.date.toISOString().split('T')[0] : sale.date,
        item: sale.item,
        quantity: sale.quantity
      });
    }
  }
  
  // Sort by date (newest first) and limit to reasonable amount for AI processing
  allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentSales = allSales.slice(0, 200); // Limit to last 200 records for AI processing
  
  for (const sale of recentSales) {
    summaryLines.push(`| ${sale.date} | ${sale.item} | ${sale.quantity} |`);
  }
  
  return summaryLines.join("\n");
}

/**
 * Calculates sales trend (increasing, decreasing, stable)
 */
function calculateTrend(sales: SalesData[]): string {
  if (sales.length < 3) return "Insufficient data";
  
  const recentSales = sales.slice(-7); // Last 7 entries
  const earlierSales = sales.slice(-14, -7); // Previous 7 entries
  
  if (earlierSales.length === 0) return "Insufficient data";
  
  const recentAvg = recentSales.reduce((sum, sale) => sum + sale.quantity, 0) / recentSales.length;
  const earlierAvg = earlierSales.reduce((sum, sale) => sum + sale.quantity, 0) / earlierSales.length;
  
  const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  
  if (change > 10) return `Increasing (+${change.toFixed(1)}%)`;
  if (change < -10) return `Decreasing (${change.toFixed(1)}%)`;
  return `Stable (${change.toFixed(1)}%)`;
}