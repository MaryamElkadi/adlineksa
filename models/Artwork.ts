import { Schema, model, models } from "mongoose";

const VersionHistorySchema = new Schema(
  {
    version: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileSize: { type: Number, default: 0 },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ArtworkSchema = new Schema(
  {
    // Owner of this artwork
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      default: "",
    },

    fileType: {
      type: String,
      default: "",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    version: {
      type: Number,
      default: 1,
    },

    versionHistory: {
      type: [VersionHistorySchema],
      default: [],
    },

    // library = normal saved artwork
    // proof = artwork waiting for customer approval
    type: {
      type: String,
      enum: ["library", "proof"],
      default: "library",
    },

    proofStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "revision_requested",
      ],
      default: "pending",
    },

    revisionNote: {
      type: String,
      default: "",
    },

    adminComment: {
      type: String,
      default: "",
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ArtworkSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default models.Artwork || model("Artwork", ArtworkSchema);