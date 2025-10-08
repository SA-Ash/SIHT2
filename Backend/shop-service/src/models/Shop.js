import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
  {
    colorPrinting: { type: Boolean, default: false },
    binding: { type: Boolean, default: false },
    laminating: { type: Boolean, default: false },
  },
  { _id: false }
);

const capacitySchema = new mongoose.Schema(
  {
    maxQueue: { type: Number, default: 10 },
    currentQueue: { type: Number, default: 0 },
    processingRate: { type: Number, default: 10 },
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
      },
    },
    address: { type: String },
    contact: { type: String },
    capacity: { type: capacitySchema, default: () => ({}) },
    services: { type: [servicesSchema], default: [] },
    pricing: { type: Map, of: Number, default: {} },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopSchema.index({ location: "2dsphere" });

export const Shop = mongoose.model("Shop", shopSchema);


