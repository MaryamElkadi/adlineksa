import { Schema, model, models } from "mongoose";

const QuotationSchema = new Schema(
  {
    // Connect quotation to the logged-in user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "",
    },

    specs: {
      type: String,
      default: "",
    },

    company: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "عميل",
    },

    phone: {
      type: String,
      default: "غير مدخل",
    },

    email: {
      type: String,
      default: "user@example.com",
    },

    city: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
    },

    width: {
      type: Number,
      default: 0,
    },

    height: {
      type: Number,
      default: 0,
    },

    material: {
      type: String,
      default: "",
    },

    deliveryDate: {
      type: String,
      default: "",
    },

    details: {
      type: String,
      default: "",
    },

    attachments: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Reviewed",
        "Quoted",
        "Accepted",
        "Rejected",
      ],
      default: "Pending",
    },

    quotationPrice: {
      type: Number,
      default: 0,
    },

    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Quotation ||
  model("Quotation", QuotationSchema);