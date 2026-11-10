import { createError } from "../middleware/errorMiddleware.js";
import Holiday from "../models/holidayModel.js";
import empServices, { dutyServices } from "../services/emp.service.js";

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().lean();
    if (!holidays) throw createError("holidays not found", 404);
    res.status(200).json(holidays);
  } catch (error) {
    next(error);
  }
};

const getAttendence = async (req, res, next) => {
  try {
    const attendences = await empServices.getAttendence(req.user);
    return res.status(200).json(attendences);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const markActive = async (req, res, next) => {
  try {
    const data = await empServices.markActive(req);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const markAttendence = async (req, res, next) => {
  try {
    const data = await empServices.markAttendance(req);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const attendenceAssign = async (req, res, next) => {
  try {
    const data = await empServices.attendenceAssign(req);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getCoordinates = async (req, res, next) => {
  try {
    const data = await empServices.getCoOrdinates(req.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getAdavances = async (req, res, next) => {
  try {
    const data = await empServices.getAdvances(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const markCheckout = async (req, res, next) => {
  try {
    const data = await empServices.markCheckout(req?.params?.id);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const addDuty = async (req, res, next) => {
  try {
    const data = await dutyServices.createDuty(req?.body);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getDuties = async (req, res, next) => {
  try {
    const duties = await dutyServices.getDuty();
    return res.status(200).json(duties);
  } catch (error) {
    next(error);
  }
};

export {
  getHolidays,
  getAttendence,
  markActive,
  markAttendence,
  attendenceAssign,
  getCoordinates,
  getAdavances,
  markCheckout,
  addDuty,
  getDuties,
};
