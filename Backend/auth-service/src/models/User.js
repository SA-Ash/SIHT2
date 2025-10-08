import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["client", "shop", "admin"], default: "client" },
    phone: { type: String },
    email: { type: String },
    googleId: { type: String },
    name: { type: String },
    college: { type: String },
    passwordHash: { type: String },
    refreshTokenHash: { type: String },
    lastLoginAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    meta: { type: Object },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { sparse: true, unique: false });
userSchema.index({ email: 1 }, { sparse: true, unique: false });
userSchema.index({ googleId: 1 }, { sparse: true, unique: false });

export const User = mongoose.model("User", userSchema);


