import { getMessaging } from "firebase-admin/messaging";
import User from "../models/userModel.js";
import { startEndDate } from "./emp.service.js";
import Attendence from "../models/attendenceModel.js";
import { CHECKPOINT_WINDOWS } from "../utils/helperFunction.js";

const otherServices = {
  validateTokens: function (tokens) {
    const validEntries = (tokens || []).filter((item) => item.token);
    const validTokens = validEntries.map((item) => item.token);

    return validTokens;
  },
  sendTestNotification: async (userId) => {
    if (!userId) {
      throw new Error("userId is required");
    }

    const user = await User.findById(userId).select("firstname +fcmTokens");
    if (!user) {
      throw new Error("User not found");
    }

    const validTokens = this.validateTokens(user.fcmTokens);
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
    const now = new Date();
    const { startOfDay, endOfDay } = startEndDate();

    const users = await User.find({
      active: true,
      "fcmTokens.0": { $exists: true },
      "duty.endTime": { $exists: true, $ne: "" },
    })
      .select("firstname duty +fcmTokens")
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

      const [hours, minutes] = user.duty.endTime.split(":").map(Number);

      const dutyEnd = new Date(startOfDay);
      dutyEnd.setHours(hours, minutes, 0, 0);

      const tenMinutesBefore = new Date(dutyEnd.getTime() - 10 * 60000);
      const oneMinuteAfter = new Date(dutyEnd.getTime() + 60000);

      let body;

      if (now >= tenMinutesBefore && now < dutyEnd) {
        body = "Your duty ends in 10 minutes. Please remember to clock out.";
      } else if (
        now >= oneMinuteAfter &&
        now < new Date(oneMinuteAfter.getTime() + 60000)
      ) {
        body = "Your duty ended 1 minute ago. Please remember to clock out.";
      }

      if (!body) continue;

      const tokens = user.fcmTokens.map(({ token }) => token).filter(Boolean);

      if (!tokens.length) continue;

      await getMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `Hello ${user.firstname || "there"}, Time to Check Out!`,
          body,
        },
        data: {
          type: "checkout_reminder",
          userId: user._id.toString(),
        },
      });
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

  midEveReminder: async function () {
    const { MID_DAY, MID_EVE } = CHECKPOINT_WINDOWS;

    const toISTDateStr = (date) =>
      new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    const today = toISTDateStr(new Date());
    const startOfToday = new Date(`${today}T00:00:00+05:30`);
    const endOfToday = new Date(`${today}T23:59:59.999+05:30`);

    const records = await Attendence.find({
      status: "Present",
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    })
      .populate({ path: "user", select: "fcmTokens firstname _id" })
      .lean();

    if (!records.length) return [];

    const messaging = getMessaging();
    const results = [];

    for (const record of records) {
      if (!record.user) continue;

      const isMidDayToday =
        record[MID_DAY.field] && toISTDateStr(record[MID_DAY.field]) === today;
      const isMidEveToday =
        record[MID_EVE.field] && toISTDateStr(record[MID_EVE.field]) === today;

      // if (!isMidDayToday || isMidEveToday) continue;

      const rawTokens = record.user.fcmTokens || [];
      const tokens = [...new Set(this.validateTokens(rawTokens))];

      if (!tokens.length) continue;

      const res = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: MID_EVE.label,
          body: `Hi ${record.user.firstname || "there"}, please mark your ${MID_EVE.label}.`,
        },
        data: {
          type: "mid_eve_reminder",
          userId: String(record.user._id),
        },
      });

      results.push({
        userId: String(record.user._id),
        successCount: res.successCount,
        failureCount: res.failureCount,
      });
    }

    return { results };
  },
};

export default otherServices;
