import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set — skipping DB connection");
    return;
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
