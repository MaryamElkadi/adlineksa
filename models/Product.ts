import mongoose, { Schema, model, models } from "mongoose";

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

const ConfigOptionSchema = new Schema({
  label: { type: String, required: true, trim: true },
  priceModifier: { type: Number, default: 0 },
}, { _id: false });

const QuantityTierSchema = new Schema({
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { _id: false });

const ProductColorSchema = new Schema({
  label: { type: String, required: true, trim: true },
  hex: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
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
  pricingType: { type: String, enum: ["quantity", "tiered", "meter"] },
  colorSelectionMode: { type: String, enum: ["custom", "predefined"], default: "predefined" },
  configurableDesignPlacements: { type: [ConfigOptionSchema], default: [] },
  configurablePrintSides: { type: [ConfigOptionSchema], default: [] },
  installationAvailable: { type: Boolean, default: false },
  installationFee: { type: Number, default: 0, min: 0 },
  designFee: { type: Number, default: 75, min: 0 },
  salePrice: { type: Number, min: 0 },
  discount: { type: Number, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  colors: { type: [ProductColorSchema], default: [] },
  minQuantity: { type: Number, default: 1, min: 1 },
  maxQuantity: { type: Number, min: 1 },
  availableSizes: { type: [String], default: [] },
  materials: { type: [String], default: [] },
  configurableMaterials: { type: [ConfigOptionSchema], default: [] },
  configurableSizes: { type: [ConfigOptionSchema], default: [] },
  configurableFinishes: { type: [ConfigOptionSchema], default: [] },
  configurableQuantityTiers: { type: [QuantityTierSchema], default: [] },
  quantityTiers: { type: [Number], default: [] },
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

if (
  models.Product &&
  !["configurableMaterials", "configurableSizes", "configurableFinishes", "configurableQuantityTiers", "designFee", "pricingType", "colors", "colorSelectionMode", "configurableDesignPlacements", "configurablePrintSides", "installationAvailable", "installationFee"]
    .every((path) => models.Product.schema.path(path))
) {
  mongoose.deleteModel("Product");
}

export default models.Product || model("Product", ProductSchema);
