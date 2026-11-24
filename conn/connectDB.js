import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI is not configured");
  }

  // Reuse existing active connection on warm/hot Vercel containers
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false, // Do not hang for 10s if disconnected
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 5,
      })
      .then((conn) => {
        console.log("MongoDB connected successfully:", conn.connection.host);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // Allow next request to retry on failure
    console.error("MongoDB connection error:", err.message);
    throw err;
  }

  return cached.conn;
};

export default connectDB;