import { Schema, model, models } from "mongoose";

const ServiceSchema = new Schema({
  title: { type: String, default: "", trim: true },
  titleAr: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" },
  descriptionAr: { type: String, required: true },
  shortDescription: { type: String, default: "" },
  shortDescriptionAr: { type: String, default: "" },
  image: { type: String, default: "" },
  icon: { type: String, default: "" },
  category: { type: String, required: true, trim: true },
  price: { type: Number, min: 0 },
  priceLabel: { type: String, default: "" },
  relatedProductIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  featured: { type: Boolean, default: false },
  showInHero: { type: Boolean, default: false },
  showOnHomepage: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// Matches public catalogue and homepage query patterns.
ServiceSchema.index({ active: 1, category: 1, sortOrder: 1, createdAt: -1 });
ServiceSchema.index({ active: 1, showOnHomepage: 1, sortOrder: 1, createdAt: -1 });
ServiceSchema.index({ active: 1, featured: 1, sortOrder: 1, createdAt: -1 });

export default models.Service || model("Service", ServiceSchema);
