import empServices from "../services/emp.service.js";

export const getAttendence = async (req, res, next) => {
  try {
    const attendences = await empServices.getAttendence(req.user);
    return res.status(200).json(attendences);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const markAttendence = async (req, res, next) => {
  try {
    const data = await empServices.markAttendance(req);
    return res.status(200).json(data);
  } catch (error) {
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
