import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import otherServices from "../services/other.service.js";

export const sendNotification = async (req, res, next) => {
  try {
    const notification = await otherServices.reminderNotification(req);
    res.send(notification);
  } catch (error) {
    next(error);
  }
};

export const testNotification = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const user = await User.findById(userId).select("firstname +fcmTokens");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokens = user.fcmTokens.map((item) => item.token).filter(Boolean);

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "Test Notification 🔔",
        body: `Hello ${user.firstname}, your FCM notification is working!`,
      },
      data: {
        type: "test_notification",
        userId: user._id.toString(),
      },
    });

    return res.status(200).json({
      message: "Notification sent",
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
