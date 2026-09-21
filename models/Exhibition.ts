import { Schema, model, models } from "mongoose";

const ExhibitionSchema = new Schema({
  title: { type: String, default: "", trim: true }, titleAr: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "" }, descriptionAr: { type: String, required: true },
  shortDescription: { type: String, default: "" }, shortDescriptionAr: { type: String, default: "" },
  image: { type: String, required: true }, gallery: { type: [String], default: [] },
  category: { type: String, required: true }, categoryAr: { type: String, default: "" },
  location: { type: String, default: "" }, locationAr: { type: String, default: "" },
  date: { type: Date }, endDate: { type: Date }, price: { type: Number, min: 0 }, priceLabel: { type: String, default: "" },
  features: { type: [String], default: [] }, featuresAr: { type: [String], default: [] },
  services: { type: [String], default: [] }, servicesAr: { type: [String], default: [] },
  relatedServiceIds: { type: [Schema.Types.ObjectId], ref: "Service", default: [] },
  relatedProductIds: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  featured: { type: Boolean, default: false }, showOnHomepage: { type: Boolean, default: false }, active: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
ExhibitionSchema.index({ active: 1, category: 1, sortOrder: 1, createdAt: -1 });
ExhibitionSchema.index({ active: 1, showOnHomepage: 1, sortOrder: 1, createdAt: -1 });
ExhibitionSchema.index({ active: 1, featured: 1, sortOrder: 1, createdAt: -1 });
export default models.Exhibition || model("Exhibition", ExhibitionSchema);
