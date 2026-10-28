import { createError } from "../middleware/errorMiddleware.js";
import Holiday from "../models/holidayModel.js";
import empServices from "../services/emp.service.js";

export const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().lean();
    if (!holidays) throw createError("holidays not found", 404);
    res.status(200).json(holidays);
  } catch (error) {
    next(error);
  }
};

export const getAttendence = async (req, res, next) => {
  console.log(req.user);
  try {
    const attendences = await empServices.getAttendence(req.user);
    return res.status(200).json(attendences);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const markActive = async (req, res, next) => {
  try {
    const data = await empServices.markActive(req);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const markAttendence = async (req, res, next) => {
  try {
    const data = await empServices.markAttendance(req);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const attendenceAssign = async (req, res, next) => {
  try {
    const data = await empServices.attendenceAssign(req);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getCoordinates = async (req, res, next) => {
  try {
    const data = await empServices.getCoOrdinates(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getAdavances = async (req, res, next) => {
  try {
    const data = await empServices.getAdvances(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
