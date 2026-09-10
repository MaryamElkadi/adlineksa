// lib/skuGenerator.ts

/**
 * Ensure a product has a SKU. If missing, generate one based on the ObjectId.
 * The format is ADL-XXXXXX where XXXXXX are the last 6 characters of the ObjectId.
 */
export async function ensureSku(product: any): Promise<string> {
  if (product.sku) return product.sku;
  const generated = `ADL-${product._id.toString().slice(-6)}`;
  // Update the document directly
  await product.updateOne({ sku: generated });
  return generated;
}
