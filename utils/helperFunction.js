import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { createError } from "../middleware/errorMiddleware.js";

export const createToken = async (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY },
  );

  return token;
};

export const resetTodaysAttendeceDaily = async () => {
  const today = new Date().setHours(0, 0, 0, 0);
};

export const uploadToCloud = async ({ filePath, filename }) => {
  const isDocument =
    filename.endsWith(".pdf") ||
    filename.endsWith(".doc") ||
    filename.endsWith(".docx");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "SMs",
        resource_type: isDocument ? "raw" : "image",
        public_id: filename,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return reject(
            createError(error.message || "Upload to cloud error", 500),
          );
        }
        resolve(result);
      },
    );

    uploadStream.end(filePath);
  });
};

export const compareDate = (a, b) =>
  new Date(a).toISOString().split("T")[0] ===
  new Date(b).toISOString().split("T")[0];

export const getDistanceInMeteres = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2;
  return R * c;
};
