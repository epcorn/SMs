import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import { startEndDate } from "./emp.service.js";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import dotenv from "dotenv";
import Attendence from "../models/attendenceModel.js";
dotenv.config();

if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString(
        "utf8",
      ),
    );
    initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error("Firebase init failed:", err.message);
  }
}

const otherServices = {
  reminderNotification: async () => {
    const { endOfDay, startOfDay } = startEndDate();

    const users = await User.find({
      "fcmTokens.0": { $exists: true },
      $or: [{ reminderSentOn: null }, { reminderSentOn: { $lt: startOfDay } }],
    })
      .select("firstname fcmTokens attendenceRecords")
      .populate({
        path: "attendenceRecords",
        match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "Present",
          checkOutTime: null,
        },
      });

    console.log(
      "Day range:",
      startOfDay,
      endOfDay,
      "| users with tokens:",
      users?.length,
    );

    const usersToRemind = users.filter(
      (user) => user.attendenceRecords && user.attendenceRecords.length > 0,
    );

    if (usersToRemind.length === 0) {
      return { message: "No users need a reminder today." };
    }

    let successCount = 0;
    let failureCount = 0;
    const notifiedUserIds = [];

    for (const user of usersToRemind) {
      const userName = user.firstname || "there";

      try {
        const res = await getMessaging().sendEachForMulticast({
          tokens: user.fcmTokens,
          notification: {
            title: `Hello ${userName}, Time to Check Out!`,
            body: "It looks like you haven't checked out for today yet. Please remember to clock out.",
          },
          data: {
            type: "checkout_reminder",
            userId: user._id.toString(),
          },
        });

        successCount += res.successCount;
        failureCount += res.failureCount;

        // collect dead tokens for cleanup
        const dead = [];
        res.responses.forEach((r, i) => {
          if (!r.success) {
            console.error(
              "FCM send failed:",
              user._id,
              r.error?.code,
              r.error?.message,
            );
            const code = r.error?.code;
            if (
              code === "messaging/registration-token-not-registered" ||
              code === "messaging/invalid-registration-token"
            ) {
              dead.push(user.fcmTokens[i]);
            }
          }
        });

        if (dead.length) {
          await User.updateOne(
            { _id: user._id },
            { $pull: { fcmTokens: { $in: dead } } },
          );
        }

        // mark as reminded if at least one device received it
        if (res.successCount > 0) notifiedUserIds.push(user._id);
      } catch (error) {
        failureCount++;
        console.error(
          "Reminder failed for user",
          user._id,
          error.code || error.message,
        );
      }
    }

    if (notifiedUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: notifiedUserIds } },
        { $set: { reminderSentOn: new Date() } },
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
    const now = new Date();

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
      const checkOut = now;

      const diffMs = checkOut - checkIn;
      const totalWorkingHours = parseFloat(
        (diffMs / (1000 * 60 * 60)).toFixed(2),
      );

      rec.checkOutTime = checkOut;
      rec.totalWorkingHours = totalWorkingHours > 0 ? totalWorkingHours : 0;

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
