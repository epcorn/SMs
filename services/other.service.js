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
      "fcmTokens.token": { $exists: true, $ne: "" },
      $or: [{ reminderSentOn: null }, { reminderSentOn: { $lt: startOfDay } }],
    })
      .select("firstname +fcmTokens attendenceRecords")
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

    for (const user of usersToRemind) {
      const validTokenEntries = (user.fcmTokens || []).filter(
        (item) =>
          typeof item?.token === "string" && item.token.trim().length > 0,
      );

      // Clean up any empty/malformed token entries while preserving { deviceId, token, ... } objects
      if (validTokenEntries.length !== (user.fcmTokens || []).length) {
        await User.updateOne(
          { _id: user._id },
          { $set: { fcmTokens: validTokenEntries } },
        );
      }

      const validTokens = validTokenEntries.map((item) => item.token);
      if (validTokens.length === 0) continue;

      const userName = user.firstname || "there";

      try {
        const res = await getMessaging().sendEachForMulticast({
          tokens: validTokens,
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

        // Collect dead/403 tokens for cleanup
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
            const msg = r.error?.message || "";
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

        // Mark as reminded if at least one device received it
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
