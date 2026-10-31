import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import { startEndDate } from "./emp.service.js";
import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import dotenv from "dotenv";
import Attendence from "../models/attendenceModel.js";
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

    // 1. Find users who have an FCM token and an active attendance record for today
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } })
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
      });

    const usersToRemind = users.filter(
      (user) => user.attendenceRecords && user.attendenceRecords.length > 0,
    );

    if (usersToRemind.length === 0) {
      return { message: "No users need a reminder today." };
    }

    let successCount = 0;
    let failureCount = 0;
    const notifiedUserIds = [];

    // 2. Loop through each user individually so notifications are completely decoupled
    for (const user of usersToRemind) {
      // Optional: Personalize the notification with the user's first name
      const userName = user.firstname ? user.firstname : "there";

      const message = {
        notification: {
          title: `Hello ${userName}, Time to Check Out!`,
          body: "It looks like you haven't checked out for today yet. Please remember to clock out.",
        },
        data: {
          type: "checkout_reminder",
          userId: user._id.toString(),
        },
        token: user.fcmToken, // Individual token per user
      };

      try {
        await getMessaging().send(message);
        successCount++;
        notifiedUserIds.push(user._id);
      } catch (error) {
        failureCount++;
        console.error(
          `Failed to send reminder to user ${user._id}:`,
          error.code || error.message,
        );

        // 3. Automatically clean up stale or unregistered FCM tokens from this specific user
        if (
          error.code === "messaging/registration-token-not-registered" ||
          error.code === "messaging/invalid-registration-token"
        ) {
          console.log(`Removing stale fcmToken for user: ${user._id}`);
          await User.findByIdAndUpdate(user._id, { $unset: { fcmToken: 1 } });
        }
      }
    }

    // 4. Mark reminder as sent only for the users who successfully received it
    if (notifiedUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: notifiedUserIds } },
        { $set: { reminderSent: true } },
      );
    }

    return {
      successCount,
      failureCount,
      message: `Processed reminders: ${successCount} sent, ${failureCount} failed.`,
    };
  },
  autoCheckOut: async () => {
    const { endOfDay, startOfDay } = startEndDate();
    const now = new Date(); // Current time or set to 7:30 PM if testing

    // Find all active attendance records for today that haven't checked out yet
    const attRecords = await Attendence.find({
      status: { $in: ["Present", "Half-day"] },
      checkInTime: { $ne: null },
      checkOutTime: null,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attRecords || attRecords.length === 0) {
      return {
        message: "No active attendance records found for auto-checkout.",
      };
    }

    let updatedCount = 0;

    for (const rec of attRecords) {
      const checkIn = new Date(rec.checkInTime);
      const checkOut = now; // 7:30 PM or current time

      // Calculate total working hours
      const diffMs = checkOut - checkIn;
      const totalWorkingHours = parseFloat(
        (diffMs / (1000 * 60 * 60)).toFixed(2),
      );

      // Update fields
      rec.checkOutTime = checkOut;
      rec.totalWorkingHours = totalWorkingHours > 0 ? totalWorkingHours : 0;

      // Optional: push into your history sub-document array
      rec.history.push({
        action: "CHECK_OUT",
        status: rec.status,
        changedBy: rec.user,
        reason: "Automatic checked out at 7:30 PM",
        date: new Date(),
      });

      await rec.save();
      updatedCount++;
    }

    return {
      success: true,
      updatedCount,
      message: `Auto-checked out ${updatedCount} users successfully.`,
    };
  },
};

export default otherServices;
