import { model, models, Schema } from "mongoose";

const RevokedSessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);

RevokedSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.RevokedSession ||
  model("RevokedSession", RevokedSessionSchema);
