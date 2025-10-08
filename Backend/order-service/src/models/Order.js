import mongoose from "mongoose";

const printConfigSchema = new mongoose.Schema(
  {
    pages: { type: Number, required: true },
    color: { type: Boolean, default: false },
    doubleSided: { type: Boolean, default: false },
    copies: { type: Number, default: 1, min: 1 },
    paperSize: { type: String, default: "A4" },
    paperType: { type: String, default: "standard" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "printing", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    fileUrl: { type: String, required: true },
    printConfig: { type: printConfigSchema, required: true },
    college: { type: String },
    totalCost: { type: Number, required: true, min: 0 },
    estimatedTime: { type: Number, default: 0 },
    queuePosition: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ shopId: 1, status: 1, createdAt: 1 });

export const Order = mongoose.model("Order", orderSchema);


