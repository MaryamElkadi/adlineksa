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

    quoteNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      default: "طلب تسعير خاص",
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
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "مطابوعات عامة",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
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
        "Cancelled",
      ],
      default: "Pending",
    },

    quotationPrice: {
      type: Number,
      default: 0,
    },

    vatAmount: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    validUntil: {
      type: String,
      default: "",
    },

    customerNotes: {
      type: String,
      default: "",
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

QuotationSchema.index({ userId: 1, createdAt: -1 });
QuotationSchema.index({ status: 1 });

export default models.Quotation || model("Quotation", QuotationSchema);