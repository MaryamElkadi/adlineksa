import { Schema, model, models } from "mongoose";

const QuotationSchema = new Schema(
  {
    company: String,
    name: String,
    phone: String,
    email: String,
    city: String,

    category: String,
    quantity: Number,
    width: Number,
    height: Number,
    material: String,

    deliveryDate: String,
    details: String,

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