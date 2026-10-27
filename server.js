import { originalConsoleError } from "./utils/redErrorConsole.js";
originalConsoleError();

import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import connectDB from "./conn/connectDB.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import userRouter from "./routes/userRoutes.js";
import authRoute, { dashRoute } from "./routes/authRoutes.js";
import { authentication } from "./middleware/authMiddleware.js";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import empRouter from "./routes/empRoutes.js";
import siteRouter from "./routes/siteRoutes.js";

const app = express();
const PORT = 8000;
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.frontend_url || [
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

const mongouri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI
    : process.env.MONGO_LOCAL;

    
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

//connect database
connectDB(mongouri);

app.use("/api/auth", authRoute);
app.use("/api/dash", dashRoute);
app.use("/api/user", authentication, userRouter);
app.use("/api/emp", authentication, empRouter);
app.use("/api/site", authentication, siteRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "production") {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });

  app.listen(PORT, () => {
    console.log("Server started on:", PORT);
  });
}

export default app;
