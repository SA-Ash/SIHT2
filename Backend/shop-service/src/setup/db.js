import mongoose from "mongoose";

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/quickprint_shops";
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, { autoIndex: true, serverSelectionTimeoutMS: 5000 });
}


