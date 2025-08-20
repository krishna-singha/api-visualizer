import mongoose from "mongoose";

mongoose.set("sanitizeFilter", true);

export const connectMongoDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017";

  try {
    await mongoose.connect(MONGODB_URI, { dbName: "api-visualizer" });
    // console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error");
    throw error;
  }
};
