import jwt from "jsonwebtoken";
import { createError } from "./errorMiddleware.js";

export const authentication = (req, res, next) => {
  const token = req.cookies?.EMS_token;

  if (!token) {
    console.log("AUTH: no EMS_token cookie on", req.method, req.originalUrl);
    return next(createError("You are not authorised", 401));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.log("AUTH: verify failed:", error.name, error.message);
    next(createError("Access token expired or invalid", 401));
  }
};



export const operatorAccess = (req, res, next) => {
  const token = req.cookies.EMS_token;
  if (!token) return next(createError("You are not authorised", 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["operator", "admin"].includes(decoded.role)) {
      return next(createError("You don't have permission", 403));
    }
    req.user = decoded;
    next();
  } catch {
    next(createError("Access token expired or invalid", 401));
  }
};

export const empAccess = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw createError("Yout are not authorised", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!["operator", "admin", "employee"].includes(decoded.role)) {
    throw createError("Yout dont have permission", 401);
  }

  req.user = decoded;
  next();
};
