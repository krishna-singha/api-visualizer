import mongoose from "mongoose";

export const connectMongoDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017";

  try {
    await mongoose.connect(`${MONGODB_URI}/api-visualizer`);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};