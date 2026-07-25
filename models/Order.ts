import { Schema, model, models } from "mongoose";

const CartItemSchema = new Schema({
  productId: { type: String, required: true }, productName: { type: String, required: true },
  image: { type: String, default: "" }, size: { type: String, default: "" }, material: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 }, unitPrice: { type: Number, required: true, min: 0 }, totalPrice: { type: Number, required: true, min: 0 },
  customNotes: String, fileUrl: String,
}, { _id: false });

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ["Pending", "In Production", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  total: { type: Number, required: true, min: 0 }, items: { type: [CartItemSchema], required: true }, shippingAddress: { type: String, required: true },
  customer: { fullName: { type: String, required: true }, email: { type: String, required: true }, phone: { type: String, required: true } },
  paymentMethod: { type: String, enum: ["mada", "applepay", "stcpay", "invoice"], required: true },
}, { timestamps: true });

export default models.Order || model("Order", OrderSchema);
