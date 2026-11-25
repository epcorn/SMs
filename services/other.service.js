import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import { startEndDate } from "./emp.service.js";
import Attendence from "../models/attendenceModel.js";

const otherServices = {
  sendTestNotification: async (userId) => {
    if (!userId) {
      throw new Error("userId is required");
    }

    const user = await User.findById(userId).select("firstname +fcmTokens");
    if (!user) {
      throw new Error("User not found");
    }

    const validEntries = (user.fcmTokens || []).filter((item) => item.token);

    // if (validEntries.length === 0) {
    //   return {
    //     success: false,
    //     message: "User has no valid FCM tokens stored.",
    //   };
    // }

    const validTokens = validEntries.map((item) => item.token);
    const userName = user.firstname || "there";

    const res = await getMessaging().sendEachForMulticast({
      tokens: validTokens,
      notification: {
        title: `Hello ${userName}!`,
        body: "This is a test push notification.",
      },
      data: {
        type: "test_notification",
        userId: user._id.toString(),
      },
    });

    const errors = [];
    const dead = [];

    res.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code;
        const msg = r.error?.message || "";

        errors.push({
          deviceId: validEntries[i]?.deviceId || "unknown",
          deviceName: validEntries[i]?.deviceName || "unknown",
          tokenPreview: `${validTokens[i].slice(0, 12)}...`,
          code,
          message: msg,
        });

        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token" ||
          code === "messaging/invalid-payload" ||
          msg.includes("THIRD_PARTY_PERMISSION_DENIED")
        ) {
          dead.push(validTokens[i]);
        }
      }
    });

    if (dead.length) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { fcmTokens: { token: { $in: dead } } } },
      );
    }

    return {
      success: res.successCount > 0,
      totalTokens: validTokens.length,
      successCount: res.successCount,
      failureCount: res.failureCount,
      removedDeadTokens: dead.length,
      errors,
    };
  },

  reminderNotification: async () => {
    const { endOfDay, startOfDay } = startEndDate();

    const users = await User.find({
      "fcmTokens.0": { $exists: true },
      $or: [{ reminderSentOn: null }, { reminderSentOn: { $lt: startOfDay } }],
    })
      .select("firstname +fcmTokens")
      .populate({
        path: "attendenceRecords",
        match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: "Present",
          checkOutTime: null,
        },
      });

    for (const user of users) {
      if (!user.attendenceRecords?.length) continue;

      const tokens = user.fcmTokens.map((item) => item.token).filter(Boolean);

      if (!tokens.length) continue;

      await getMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `Hello ${user.firstname || "there"}, Time to Check Out!`,
          body: "Please remember to clock out for today.",
        },
        data: {
          type: "checkout_reminder",
          userId: user._id.toString(),
        },
      });

      user.reminderSentOn = new Date();
      await user.save();
    }

    return { message: "Checkout reminders processed." };
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
