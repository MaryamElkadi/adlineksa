import bcrypt from "bcryptjs";
import { CATEGORIES, PRODUCTS } from "@/lib/constants";
import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";

let seedPromise: Promise<void> | undefined;

export function ensureInitialCatalog() {
  if (!seedPromise) seedPromise = (async () => {
    if (await Category.estimatedDocumentCount() === 0) {
      await Category.insertMany(CATEGORIES.map(({ id, itemCount, ...category }) => category));
    }
    if (await Product.estimatedDocumentCount() === 0) {
      await Product.insertMany(PRODUCTS.map(({ id, ...product }) => ({ ...product, featured: true })));
    }
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Adline@2026", 10);
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@adlineksa.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        isActive: true,
      });
    }
  })();
  return seedPromise;
}

