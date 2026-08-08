import { Schema, model, models } from "mongoose";

const QuoteSchema = new Schema(
  {
    // IMPORTANT:
    // The quote belongs to this user.
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    whatsapp: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    productType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    width: {
      type: Number,
    },

    height: {
      type: Number,
    },

    material: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    files: {
      type: [String],
      default: [],
    },

    estimatedPrice: {
      type: Number,
    },

    adminReply: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "New",
        "Pending",
        "In Progress",
        "Quoted",
        "Approved",
        "Rejected",
      ],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Quote || model("Quote", QuoteSchema);