import mongoose from "mongoose";

const connectDB = (uri) => {
  if (!uri) {
    throw new Error("MONGO_URI is not configured", uri);
  }

  mongoose.connect(uri).then(conn=> console.log("MongoDB connected successfully",conn.connection.host)).catch(err=>console.error(err));
  
};

export default connectDB;
