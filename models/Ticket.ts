import { Schema, model, models } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },

    senderName: {
      type: String,
      default: "مستخدم",
    },

    text: {
      type: String,
      required: true,
    },

    attachments: {
      type: [String],
      default: [],
    },

    isInternalNote: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

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

    messages: {
      type: [MessageSchema],
      default: [],
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

TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ status: 1 });

export default models.Ticket || model("Ticket", TicketSchema);