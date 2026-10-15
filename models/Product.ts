import { Schema, model, models } from "mongoose";

const ImageMediaSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: "" },
  alt: { type: String, default: "" },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

const VideoMediaSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, default: "" },
  thumbnailUrl: { type: String, default: "" },
  provider: { type: String, enum: ["cloudinary", "youtube", "vimeo"], required: true },
  title: { type: String, default: "" },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

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
  images: { type: [ImageMediaSchema], default: [] },
  videos: { type: [VideoMediaSchema], default: [] },
  coverImage: { type: String, default: "" },
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
  mostUsed: { type: Boolean, default: false },
  sku: { type: String, unique: true, sparse: true },
  marketplaceData: {
    amazon: {
      sku: { type: String },
      asin: { type: String },
      exported: { type: Boolean, default: false },
      lastExportedAt: { type: Date },
    },
    noon: {
      psku: { type: String },
      exported: { type: Boolean, default: false },
      lastExportedAt: { type: Date },
    },
  },

}, { timestamps: true });

export default models.Product || model("Product", ProductSchema);
