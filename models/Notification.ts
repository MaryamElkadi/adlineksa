import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["order", "quote", "proof", "ticket", "system"],
      default: "system",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default models.Notification || model("Notification", NotificationSchema);
