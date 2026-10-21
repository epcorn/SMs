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

export const getDistanceInMeteres = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters

  // Ensure everything is parsed as a number to prevent NaN
  const l1 = parseFloat(lat1);
  const lo1 = parseFloat(lon1);
  const l2 = parseFloat(lat2);
  const lo2 = parseFloat(lon2);

  const dLat = (l2 - l1) * (Math.PI / 180);
  const dLon = (lo2 - lo1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(l1 * (Math.PI / 180)) *
      Math.cos(l2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  console.log("Calculated Distance:", distance, "meters"); // 🔍 Debugging log
  return distance;
};
