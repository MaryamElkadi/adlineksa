// lib/skuGenerator.ts

/**
 * Ensure a product has a SKU. If missing, generate one based on the ObjectId.
 * The format is ADL-XXXXXX where XXXXXX are the last 6 characters of the ObjectId.
 */
import Product from '@/models/Product';

/**
 * Ensure a product has a SKU. If missing, generate one based on the ObjectId.
 * Works with both Mongoose documents and plain objects.
 */
export async function ensureSku(product: any): Promise<string> {
  // If SKU already exists, return it directly.
  if (product.sku) return product.sku;

  // Generate SKU from the ObjectId (last 6 chars).
  const generated = `ADL-${product._id.toString().slice(-6)}`;

  // Persist the generated SKU using the Mongoose model.
  // This works even when `product` is a plain object.
  try {
    await Product.findByIdAndUpdate(product._id, { sku: generated }, { new: true });
  } catch (err) {
    console.error('Failed to persist SKU:', err);
  }

  // Attach the SKU to the plain object so downstream code can read it.
  product.sku = generated;
  return generated;
}
