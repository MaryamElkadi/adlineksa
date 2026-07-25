import { Schema, model, models } from "mongoose";

const QuoteSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    company: String,

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    whatsapp: String,

    city: String,

    productType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    width: Number,

    height: Number,

    material: String,

    notes: String,

    files: {
      type: [String],
      default: [],
    },

    estimatedPrice: Number,

    adminReply: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Quote || model("Quote", QuoteSchema);