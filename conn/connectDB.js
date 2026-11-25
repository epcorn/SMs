import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
    "MongoDB connected successfully:",
    mongoose.connection.host
  );

  return mongoose.connection;
};

export default connectDB;