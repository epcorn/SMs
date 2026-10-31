import otherServices from "../services/other.service.js";

export const sendNotification = async (req, res, next) => {
  try {
    const notification = await otherServices.reminderNotification(req);
    res.send(notification);
  } catch (error) {
    next(error);
  }
};
