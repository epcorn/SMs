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
    { expiresIn: "7d" },
  );

  return token;
};

export const createRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
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

/**
 * Parses a time string like "07:00 PM" or "19:00" onto the given reference date (e.g. startOfDay or record.createdAt)
 */
function getDutyEndDateTime(baseDate, dutyEndTime) {
  if (!dutyEndTime) return null;

  // If already a Date or ISO string
  if (dutyEndTime instanceof Date) {
    return Number.isNaN(dutyEndTime.getTime()) ? null : dutyEndTime;
  }

  const str = String(dutyEndTime).trim();
  const base = new Date(baseDate);

  // Match "HH:mm" or "hh:mm AM/PM"
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const dt = new Date(base);
    dt.setHours(hours, minutes, 0, 0);
    return dt;
  }

  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const dt = new Date(base);
    dt.setHours(parseInt(match24[1], 10), parseInt(match24[2], 10), 0, 0);
    return dt;
  }

  return null;
}

function isWithinFiveMinutesBeforeEnd(now, dutyEndTime, referenceDate) {
  const endDt = getDutyEndDateTime(referenceDate, dutyEndTime);
  if (!endDt) return false;

  const fiveMinsBeforeEnd = new Date(endDt.getTime() - 5 * 60 * 1000);
  // True once current time has reached (endTime - 5 mins)
  return now >= fiveMinsBeforeEnd;
}


export const CHECKPOINT_WINDOWS = {
  MID_DAY: {
    field: "midDayTime",
    label: "12:00 PM Check-In",
    startHour: 11,
    startMin: 45,
    endHour: 12,
    endMin: 30,
  },
  MID_EVE: {
    field: "midEveningTime",
    label: "3:00 PM Check-In",
    startHour: 14,
    startMin: 45,
    endHour: 16,
    endMin: 55,
  },
};