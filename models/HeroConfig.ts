import { Schema, model, models } from "mongoose";

const HeroConfigSchema = new Schema({
  items: [{
    itemType: { type: String, enum: ["product", "service"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    sortOrder: { type: Number, default: 0 },
    badge: { type: String, default: "" },
    customTitle: { type: String, default: "" },
    customTitleAr: { type: String, default: "" },
  }],
}, { timestamps: true });

export default models.HeroConfig || model("HeroConfig", HeroConfigSchema);
