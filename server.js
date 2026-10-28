
import { originalConsoleError } from "./utils/redErrorConsole.js";
originalConsoleError();

import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "./conn/connectDB.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import authRoute, { dashRoute } from "./routes/authRoutes.js";
import { authentication } from "./middleware/authMiddleware.js";
import empRouter from "./routes/empRoutes.js";
import siteRouter from "./routes/siteRoutes.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || [
      "http://localhost:3000",
      "https://sms-lake-sigma.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const mongoUri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI
    : process.env.MONGO_LOCAL;

if (!mongoUri) {
  throw new Error("MongoDB connection string is missing");
}

connectDB(mongoUri);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoute);
app.use("/api/dash", dashRoute);
app.use("/api/user", authentication, userRouter);
app.use("/api/emp", authentication, empRouter);
app.use("/api/site", authentication, siteRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 8000, () => {
    console.log("Server started");
  });
}

export default app;
