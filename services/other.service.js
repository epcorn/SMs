import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import { startEndDate } from "./emp.service.js";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import dotenv from "dotenv";
dotenv.config();

// Safely initialize Firebase without forcing a downloaded private key file
if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
    projectId: "project-587c6976-454c-43a7-8f3",
  });
}

const otherServices = {
  autoCheckout: async (req, res, next) => {
    const users = await User.find({})
      .select(
        "firstname middlename lastname role email phone attendenceRecords",
      )
      .populate("attendenceRecords");

    res.send(users);
  },
  
  reminderNotification: async () => {
    const { endOfDay, startOfDay } = startEndDate();
    const users = await User.find({ fcmToken: { $ne: null } })
      .select(
        "firstname middlename lastname role email phone attendenceRecords reminderSent fcmToken",
      )
      .populate({
        path: "attendenceRecords",
        match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "Present",
          checkOutTime: null,
        },
        options: {
          limit: 3,
        },
      });

    const usersToRemind = users.filter(
      (user) => user.attendenceRecords && user.attendenceRecords.length > 0,
    );

    if (usersToRemind.length === 0) {
      return { message: "No users need a reminder today." };
    }

    const tokens = usersToRemind.map((user) => user.fcmToken);

    const message = {
      notification: {
        title: "Forget to Check Out?",
        body: "Hi! It looks like you haven't checked out for today yet. Please remember to clock out.",
      },
      data: {
        type: "checkout_reminder",
      },
      tokens: tokens,
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(
              `Token at index ${idx} failed due to:`,
              resp.error.toJSON(),
            );
          }
        });
      }

      await User.updateMany(
        { _id: { $in: usersToRemind.map((u) => u._id) } },
        { $set: { reminderSent: true } },
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error("Error sending FCM reminder:", error);
      throw error;
    }
  },
};

export default otherServices;