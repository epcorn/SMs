import mongoose from "mongoose";

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI is not configured", uri);
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
};

export default connectDB;
