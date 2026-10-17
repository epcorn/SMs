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
    next(error);
  }
};

export const operatorAccess = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw createError("Yout are not authorised", 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!["operator", "admin"].includes(decoded.role)) {
    throw createError("Yout dont have permission", 401);
  }

  req.user = decoded;
  next();
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
