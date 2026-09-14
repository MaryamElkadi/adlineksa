// lib/excelGenerator.ts
import * as XLSX from 'xlsx';
import { ensureSku } from '@/lib/skuGenerator';
// Product model not needed for type; using any[] for products

/**
 * Generate an Excel workbook buffer for a list of products.
 * The sheet includes common fields required for Amazon and Noon exports.
 */
export async function generateExcel(products: any[], marketplace: string): Promise<Buffer> {
  // Ensure each product has a SKU (may mutate product objects)
  await Promise.all(products.map(p => ensureSku(p)));

  // Build a clean flat array of export rows – no extra fields
  const data = products.map(p => {
    const sku = p.sku ?? '';
    return {
      SKU: sku,
      Name: p.name ?? '',
      Description: p.description ?? '',
      Price: p.basePrice ?? 0,
      Quantity: p.quantity ?? 0,
      Marketplace: marketplace,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  // Explicitly limit the worksheet range to the six required columns (A-F)
  // Header row is 1, data rows start at 2. Number of rows = data.length + 1 (header).
  const totalRows = data.length + 1;
  ws['!ref'] = `A1:F${totalRows}`;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(buf);
}

