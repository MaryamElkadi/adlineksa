// lib/excelGenerator.ts
import * as XLSX from 'xlsx';
import { ensureSku } from '@/lib/skuGenerator';

const MAX_EXCEL_CELL_TEXT_LENGTH = 32_767;

function limitExcelCellText(value: string): string {
  if (value.length <= MAX_EXCEL_CELL_TEXT_LENGTH) return value;

  let end = MAX_EXCEL_CELL_TEXT_LENGTH - 1;
  if (/[\uD800-\uDBFF]/.test(value[end - 1])) end -= 1;
  return `${value.slice(0, end)}…`;
}

interface MarketplaceExportProduct {
  _id?: string;
  sku?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  quantity?: number;
  stock?: number;
}

/**
 * Generate an Excel workbook buffer for a list of products.
 * The sheet includes common fields required for Amazon and Noon exports.
 */
export async function generateExcel(products: MarketplaceExportProduct[], marketplace: string): Promise<Buffer> {
  // Ensure each product has a SKU (may mutate product objects)
  await Promise.all(products.map(p => ensureSku(p)));

  // Build a clean flat array of export rows – no extra fields
  const data = products.map(p => {
    const sku = limitExcelCellText(p.sku ?? '');
    return {
      SKU: sku,
      Name: limitExcelCellText(p.name ?? ''),
      Description: limitExcelCellText(p.description ?? ''),
      Price: p.basePrice ?? 0,
      Quantity: p.quantity ?? p.stock ?? 0,
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

export interface SallaImportProduct {
  name?: string;
  nameAr?: string;
  description?: string;
  shortDescription?: string;
  basePrice?: number;
  salePrice?: number;
  stock?: number;
  sku?: string;
  categorySlug?: string;
  image?: string;
  coverImage?: string;
  gallery?: string[];
  images?: Array<{ url: string }>;
}

export function generateSallaImportExcel(
  products: SallaImportProduct[],
  categoryNamesAr: ReadonlyMap<string, string>,
): Buffer {
  const rows = products.map((product) => {
    const imageUrls = [
      product.coverImage,
      product.image,
      ...(product.gallery || []),
      ...(product.images || []).map((image) => image.url),
    ]
      .filter((url): url is string => typeof url === "string" && Boolean(url.trim()))
      .filter((url, index, urls) => urls.indexOf(url) === index);
    const imageUrl = imageUrls.find(
      (url) => /^https?:\/\/\S+$/i.test(url) && url.length <= MAX_EXCEL_CELL_TEXT_LENGTH,
    );

    return {
      "Product Name": limitExcelCellText(product.name || ""),
      "Product Name (Arabic)": limitExcelCellText(product.nameAr || ""),
      Description: limitExcelCellText(product.description || product.shortDescription || ""),
      Price: product.salePrice ?? product.basePrice ?? 0,
      "Original Price": product.salePrice ? product.basePrice ?? 0 : "",
      Quantity: product.stock ?? 0,
      SKU: limitExcelCellText(product.sku || ""),
      Category: limitExcelCellText(categoryNamesAr.get(product.categorySlug || "") || ""),
      "صورة المنتج": imageUrl || "",
      Status: "Active",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 32 },
    { wch: 32 },
    { wch: 60 },
    { wch: 14 },
    { wch: 16 },
    { wch: 12 },
    { wch: 20 },
    { wch: 24 },
    { wch: 60 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}
