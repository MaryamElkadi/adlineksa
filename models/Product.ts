import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  nameAr: { type: String, default: "", trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  categorySlug: { type: String, required: true, trim: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  description: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  image: { type: String, default: "" },
  gallery: { type: [String], default: [] },
  basePrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  discount: { type: Number, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  minQuantity: { type: Number, default: 1, min: 1 },
  maxQuantity: { type: Number, min: 1 },
  availableSizes: { type: [String], default: [] },
  materials: { type: [String], default: [] },
  options: { type: [Schema.Types.Mixed], default: [] },
  badge: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
}, { timestamps: true });

export default models.Product || model("Product", ProductSchema);
