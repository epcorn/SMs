import jwt from "jsonwebtoken";
import { createError } from "./errorMiddleware.js";

export const authentication = async (req, res, next) => {
  const token = req.cookies.EMS_token;
  try {
    if (!token) throw createError("Yout are not authorised", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
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
