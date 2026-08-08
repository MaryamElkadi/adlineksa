import { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    size: {
      type: String,
      default: "",
    },

    material: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    customNotes: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const OrderSchema = new Schema(
  {
    // IMPORTANT
    // This connects the order to the logged-in user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Production",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    items: {
      type: [CartItemSchema],
      required: true,
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    customer: {
      fullName: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },
    },

    paymentMethod: {
      type: String,
      enum: ["mada", "applepay", "stcpay", "invoice"],
      required: true,
    },

    trackingDetails: {
      carrier: {
        type: String,
        default: "",
      },

      trackingNumber: {
        type: String,
        default: "",
      },

      estimatedDelivery: {
        type: String,
        default: "",
      },

      notes: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default models.Order || model("Order", OrderSchema);