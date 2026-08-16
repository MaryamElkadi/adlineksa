import { Schema, model, models } from "mongoose";

const SallaStoreSchema = new Schema(
  {
    merchantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    scope: {
      type: String,
      default: "",
    },

    tokenType: {
      type: String,
      default: "bearer",
    },
  },
  {
    timestamps: true,
  }
);

export default models.SallaStore ||
  model("SallaStore", SallaStoreSchema);