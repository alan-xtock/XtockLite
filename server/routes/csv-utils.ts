import { z } from "zod";

export function sanitizeNumericString(value: string): string {
  return value.replace(/[$£€¥,\s]/g, '').trim();
}

export function parseQuantity(value: string): number {
  const sanitized = sanitizeNumericString(value);
  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    throw new Error(`Invalid quantity: ${value}`);
  }
  return parsed;
}

export function parsePrice(value: string): number {
  const sanitized = sanitizeNumericString(value);
  const parsed = parseFloat(sanitized);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid price: ${value}`);
  }
  return Math.round(parsed * 100);
}

export const csvColumnSchema = z.object({
  date: z.string().pipe(z.coerce.date().refine(d => !isNaN(d.getTime()), "Invalid date format")),
  item: z.string().min(1, "Item name is required"),
  quantity: z.string().transform(parseQuantity),
  unit: z.string().optional().default("units"),
  price: z.string().optional().default("1.00").transform(parsePrice),
  supplier: z.string().optional(),
  category: z.string().optional(),
});

export function parseCsvRow(row: any): { data: any; fieldMappings: Record<string, string> } {
  const normalizedRow: any = {};
  const fieldMappings: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    const lowerKey = key.toLowerCase().trim();

    if (lowerKey.includes('date') || lowerKey.includes('timestamp')) {
      normalizedRow.date = value;
      fieldMappings.date = key;
    } else if (lowerKey.includes('supplier') || lowerKey.includes('vendor')) {
      normalizedRow.supplier = value;
      fieldMappings.supplier = key;
    } else if (lowerKey.includes('item') || lowerKey.includes('product') || lowerKey.includes('category') || (lowerKey === 'name' || lowerKey.endsWith(' name'))) {
      normalizedRow.item = value;
      fieldMappings.item = key;
    } else if (lowerKey.includes('quantity') || lowerKey.includes('qty')) {
      normalizedRow.quantity = value;
      fieldMappings.quantity = key;
    } else if (lowerKey.includes('unit') || lowerKey.includes('uom')) {
      normalizedRow.unit = value;
      fieldMappings.unit = key;
    } else if (lowerKey.includes('price') || lowerKey.includes('cost') || (lowerKey.includes('amount') && !lowerKey.includes('quantity'))) {
      normalizedRow.price = value;
      fieldMappings.price = key;
    } else if (lowerKey.includes('category') || lowerKey.includes('type')) {
      normalizedRow.category = value;
      fieldMappings.category = key;
    }
  }

  return { data: normalizedRow, fieldMappings };
}

export function validateRequiredFields(data: any, fieldMappings: Record<string, string>): string[] {
  const errors: string[] = [];
  const required = ['date', 'item', 'quantity'];

  for (const field of required) {
    if (!data[field]) {
      const suggestion = field === 'quantity' ? 'qty/quantity' : field === 'item' ? 'item/product/category' : field === 'date' ? 'date/timestamp' : field;
      errors.push(`Missing required field '${field}' (expected header: ${suggestion})`);
    }
  }

  if (!data.unit) {
    data.unit = "units";
    console.log("No unit column found - using default 'units'");
  }
  if (!data.price) {
    data.price = "1.00";
    console.log("No price column found - using default $1.00 per unit");
  }

  return errors;
}