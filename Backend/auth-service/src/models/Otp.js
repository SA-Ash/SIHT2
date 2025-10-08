import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    context: { type: String, enum: ["login", "signup"], default: "login" },
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, context: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);


