// lib/skuGenerator.ts

import Product from '@/models/Product';

/**
 * Generate a unique SKU in the format ADL-XXXXXX.
 *
 * Strategy:
 * 1. If the product already has a non-empty SKU, return it (normalised).
 * 2. Otherwise, generate a candidate from a timestamp + random suffix.
 * 3. Verify uniqueness against the database.
 * 4. If a collision occurs, retry up to MAX_RETRIES times.
 *
 * The MongoDB unique index on `sku` remains the final safety net for
 * concurrent requests.
 */

const MAX_RETRIES = 5;

/**
 * Normalise an SKU value: trim, uppercase, collapse spaces.
 */
export function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Generate a candidate SKU string.
 * Format: ADL-<last-2-digits-of-year><random-5-chars>
 * e.g. ADL-26A7F3B
 */
function generateCandidate(): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ADL-${yearSuffix}${random}`;
}

/**
 * Generate a unique SKU that does not exist in the database.
 * Optionally exclude a product ID (for edit mode).
 */
export async function generateUniqueSku(excludeId?: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidate = generateCandidate();
    const query: Record<string, unknown> = { sku: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await Product.exists(query);
    if (!exists) {
      return candidate;
    }
  }
  // Fallback: use timestamp-based SKU to virtually guarantee uniqueness
  const fallback = `ADL-${Date.now().toString(36).toUpperCase()}`;
  return fallback;
}

/**
 * Ensure a product object has a valid SKU.
 * - If `sku` is already a non-empty string, normalise and return it.
 * - Otherwise, generate a new unique SKU.
 * - If the product has an `_id`, persist the generated SKU to the database.
 */
export async function ensureSku(product: any): Promise<string> {
  // If SKU already exists and is non-empty, normalise and return it.
  if (product.sku && product.sku.trim() !== '') {
    const normalised = normalizeSku(product.sku);
    // Persist normalised version if it changed
    if (product._id && normalised !== product.sku) {
      try {
        await Product.findByIdAndUpdate(product._id, { sku: normalised });
      } catch (err) {
        console.error('Failed to normalise SKU:', err);
      }
    }
    product.sku = normalised;
    return normalised;
  }

  // Generate a new unique SKU
  const generated = await generateUniqueSku();

  // Persist the generated SKU if the product already has an _id
  if (product._id) {
    try {
      await Product.findByIdAndUpdate(product._id, { sku: generated });
    } catch (err) {
      console.error('Failed to persist SKU:', err);
    }
  }

  product.sku = generated;
  return generated;
}

/**
 * Check whether an E11000 MongoDB duplicate-key error is specifically
 * about the `sku` field.
 */
export function isSkuDuplicateError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const e = error as Error & { code?: number; keyPattern?: Record<string, number> };
  if (e.code !== 11000) return false;
  // Check keyPattern if available (Mongoose enriches the error)
  if (e.keyPattern && e.keyPattern.sku) return true;
  // Fallback: check the error message string
  return e.message?.includes('sku') ?? false;
}
