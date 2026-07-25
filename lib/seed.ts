import { CATEGORIES, PRODUCTS } from "@/lib/constants";
import Category from "@/models/Category";
import Product from "@/models/Product";

let seedPromise: Promise<void> | undefined;

export function ensureInitialCatalog() {
  if (!seedPromise) seedPromise = (async () => {
    if (await Category.estimatedDocumentCount() === 0) {
      await Category.insertMany(CATEGORIES.map(({ id, itemCount, ...category }) => category));
    }
    if (await Product.estimatedDocumentCount() === 0) {
      await Product.insertMany(PRODUCTS.map(({ id, ...product }) => ({ ...product, featured: true })));
    }
  })();
  return seedPromise;
}
