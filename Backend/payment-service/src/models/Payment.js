import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    method: { type: String, enum: ["upi", "cod"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["initiated", "pending", "paid", "failed", "refunded", "cancelled"], default: "initiated", index: true },
    providerRef: { type: String },
    upiIntent: { type: String },
    meta: { type: Object },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);


