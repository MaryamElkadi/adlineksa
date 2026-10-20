import mongoose, { Schema, model, models } from "mongoose";

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

    color: {
      type: String,
      default: "",
    },

    colorHex: {
      type: String,
      default: "",
      match: /^$|^#[0-9a-fA-F]{6}$/,
    },

    designPlacement: {
      type: String,
      default: "",
    },

    finish: {
      type: String,
      default: "",
    },

    printSide: {
      type: String,
      default: "",
    },

    lighting: {
      type: String,
      default: "",
    },

    installation: {
      type: Boolean,
      default: false,
    },

    needDesign: {
      type: Boolean,
      default: false,
    },

    designBrief: {
      type: String,
      default: "",
    },

    pricingType: {
      type: String,
      enum: ["quantity", "tiered", "meter"],
      default: "quantity",
    },
    pricingOptionId: { type: String, default: "" },
    pricingOptionLabel: { type: String, default: "" },
    pricingUnit: { type: String, enum: ["piece", "meter"], default: "piece" },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
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

    shippingCost: {
      type: Number,
      default: null,
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

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

if (
  models.Order &&
  (!models.Order.schema.path("shippingCost") ||
    !models.Order.schema.path("items.lighting") ||
    !models.Order.schema.path("items.pricingOptionId") ||
    models.Order.schema.path("userId")?.isRequired)
) {
  mongoose.deleteModel("Order");
}

export default models.Order || model("Order", OrderSchema);
