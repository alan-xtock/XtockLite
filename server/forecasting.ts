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
  confidence: number;
  reasoning: string;
  recommendedOrderQuantity: number;
  estimatedSavings: number;
  forecastType: "weekly" | "monthly" | "seasonal";
}

export interface ForecastRequest {
  salesData: SalesData[];
  forecastDays: number;
  bufferPercentage?: number; // Safety stock percentage
}

/**
 * Analyzes sales data and generates AI-powered forecasts for purchasing decisions
 */
export async function generateForecasts(request: ForecastRequest): Promise<ForecastResult[]> {
  const { salesData, forecastDays, bufferPercentage = 20 } = request;
  
  if (salesData.length === 0) {
    throw new Error("No sales data provided for forecasting");
  }

  // Group sales data by item for analysis
  const itemGroups = groupSalesDataByItem(salesData);
  
  // Prepare data summary for AI analysis
  const dataSummary = prepareSalesDataSummary(itemGroups, forecastDays);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI procurement specialist that analyzes sales data to predict future purchasing needs and optimize costs. 

Your goal is to help reduce produce costs by 10% through accurate demand forecasting and smart ordering recommendations.

For each item, analyze:
1. Sales trends and patterns (daily/weekly cycles, growth trends)
2. Seasonal variations
3. Price fluctuations
4. Optimal ordering quantity to minimize waste and stockouts

Respond with JSON in this exact format:
{
  "forecasts": [
    {
      "item": "string",
      "predictedQuantity": number,
      "confidence": number (0-1),
      "reasoning": "string explaining the prediction logic",
      "recommendedOrderQuantity": number,
      "estimatedSavings": number (in cents),
      "forecastType": "weekly" | "monthly" | "seasonal"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Analyze this sales data and generate ${forecastDays}-day forecasts:

${dataSummary}

Requirements:
- Apply ${bufferPercentage}% safety stock buffer
- Focus on cost reduction opportunities
- Consider seasonal patterns
- Recommend optimal order quantities to minimize waste
- Estimate potential savings from better purchasing decisions`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.forecasts || !Array.isArray(result.forecasts)) {
      throw new Error("Invalid AI response format");
    }

    return result.forecasts.map((forecast: any) => ({
      item: forecast.item,
      predictedQuantity: Math.max(0, Math.round(forecast.predictedQuantity || 0)),
      confidence: Math.max(0, Math.min(1, forecast.confidence || 0)),
      reasoning: forecast.reasoning || "No reasoning provided",
      recommendedOrderQuantity: Math.max(0, Math.round(forecast.recommendedOrderQuantity || 0)),
      estimatedSavings: Math.max(0, Math.round(forecast.estimatedSavings || 0)),
      forecastType: forecast.forecastType || "weekly"
    }));

  } catch (error) {
    console.error("AI forecasting error:", error);
    throw new Error(`Failed to generate forecasts: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * Prepares a structured summary of sales data for AI analysis
 */
function prepareSalesDataSummary(itemGroups: Record<string, SalesData[]>, forecastDays: number): string {
  const summaryLines = [];
  
  summaryLines.push(`SALES DATA ANALYSIS (${forecastDays}-day forecast period):`);
  summaryLines.push(`Total Items: ${Object.keys(itemGroups).length}`);
  summaryLines.push("");

  for (const [item, sales] of Object.entries(itemGroups)) {
    if (sales.length === 0) continue;
    
    // Sort by date
    sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate metrics
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalValue = sales.reduce((sum, sale) => sum + (sale.priceInCents * sale.quantity), 0);
    const avgPrice = totalValue / totalQuantity;
    const dailyAvg = totalQuantity / sales.length;
    
    // Price analysis
    const prices = sales.map(sale => sale.priceInCents);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceVariation = ((maxPrice - minPrice) / avgPrice) * 100;
    
    // Date range
    const startDate = sales[0].date;
    const endDate = sales[sales.length - 1].date;
    const daySpan = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    
    summaryLines.push(`ITEM: ${item}`);
    summaryLines.push(`  Period: ${startDate} to ${endDate} (${daySpan} days)`);
    summaryLines.push(`  Total Sales: ${totalQuantity} ${sales[0].unit}`);
    summaryLines.push(`  Daily Average: ${dailyAvg.toFixed(1)} ${sales[0].unit}`);
    summaryLines.push(`  Price Range: $${(minPrice/100).toFixed(2)} - $${(maxPrice/100).toFixed(2)} (${priceVariation.toFixed(1)}% variation)`);
    const uniqueSuppliers = Array.from(new Set(sales.map(s => s.supplier).filter(Boolean)));
    summaryLines.push(`  Suppliers: ${uniqueSuppliers.join(", ") || "Not specified"}`);
    summaryLines.push(`  Recent Trend: ${calculateTrend(sales)}`);
    summaryLines.push("");
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