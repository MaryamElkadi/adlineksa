import { Schema, model, models } from "mongoose";

const TicketSchema = new Schema(
  {
    // Owner
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Order",
        "Shipping",
        "Payment",
        "Design",
        "Technical",
        "Other",
        "الطلبات والشحن",
        "التصاميم والبروفات",
        "الحسابات والفواتير",
        "عام",
      ],
      default: "عام",
    },

    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
      ],
      default: "Open",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
      ],
      default: "Medium",
    },

    adminReply: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default models.Ticket ||
  model("Ticket", TicketSchema);