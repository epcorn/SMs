import { getMessaging } from "firebase-admin/messaging";
import { createError } from "../middleware/errorMiddleware.js";
import Attendence from "../models/attendenceModel.js";
import Duty from "../models/dutyModel.js";
import User from "../models/userModel.js";
import {
  CHECKPOINT_WINDOWS,
  getDistanceInMeteres,
} from "../utils/helperFunction.js";

export const startEndDate = (start) => {
  const startDate = start ? new Date(start) : new Date();

  const startOfDay = new Date(startDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(startDate.setUTCHours(23, 59, 59, 999));

  return { startOfDay, endOfDay };
};

function isWithinWindow(dateObj, config) {
  const currentMinutes = dateObj.getHours() * 60 + dateObj.getMinutes();
  const startMinutes = config.startHour * 60 + config.startMin;
  const endMinutes = config.endHour * 60 + config.endMin;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function formatWindowRange(config) {
  const fmt = (h, m) => {
    const period = h >= 12 ? "PM" : "AM";
    const twelve = h % 12 === 0 ? 12 : h % 12;
    return `${String(twelve).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(config.startHour, config.startMin)} - ${fmt(config.endHour, config.endMin)}`;
}

export const calcTotalHours = (inTime) => {
  const now = new Date();
  const diffMs = now - new Date(inTime);
  const totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  return totalHours;
};

const empServices = {
  existAttendence: async (id) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existAtt = await Attendence.findOne({
      user: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const user = await User.findById(id).select("active");

    if (user.active === false) {
      throw createError("User is not active", 400);
    }

    return existAtt;
  },
  getcoords: async (user) => {
    if (["admin"].includes(user.role)) return true;

    const me = await User.findById(user.id)
      .select("location site")
      .populate("site");

    const lat1 = me.location.coordinates[1],
      lon1 = me.location.coordinates[0],
      lat2 = me.site.location.coordinates[1],
      lon2 = me.site.location.coordinates[0];

    const distance = getDistanceInMeteres(lat1, lon1, lat2, lon2);
    const allowedRadius = me.site.radius || 100;

    if (distance > allowedRadius)
      throw createError("You are too far from office Location", 400);
  },

  markAttendance: async function ({ body, user }) {
    const now = new Date();
    const { action, coords } = body;

    const existAtt = await this.existAttendence(user.id);

    if (Array.isArray(coords) && coords.length === 2) {
      await User.findByIdAndUpdate(user.id, {
        $set: { "location.coordinates": coords },
      });
    }

    await this.getcoords(user);

    if (action === "CHECK_IN") {
      if (existAtt)
        throw createError("Attendance already marked for today", 400);

      const { endOfDay, startOfDay } = startEndDate(now);
      const assignedDuty = await Duty.findOne({
        user: user.id,
        startTime: { $gte: startOfDay, $lte: endOfDay },
      });

      let checkInReason = "User CheckIn";

      if (assignedDuty?.startTime) {
        const startTimeMs = new Date(assignedDuty?.startTime).getTime();
        const gracePeriodMs = 15 * 60 * 1000;

        if (now.getTime() > startTimeMs + gracePeriodMs) {
          const minutesLate = Math.floor(
            (now.getTime() - startTimeMs) / (60 * 1000),
          );
          checkInReason = `Late CheckIn (${minutesLate} mins late)`;
        }
      }

      const att = await Attendence.create({
        user: user.id,
        status: "Present",
        checkInTime: now,
        history: [
          {
            status: "Present",
            action: "CHECK_IN",
            date: now,
            changedBy: user.id,
            reason: checkInReason,
          },
        ],
      });

      return { msg: `Marked ${att.status}`, attendance: att };
    }

    // Require active check-in for all subsequent actions
    if (!existAtt || !existAtt.checkInTime) {
      throw createError("No active check-in found for today", 404);
    }
    if (existAtt.checkOutTime) {
      throw createError("Already checked out for today", 400);
    }

    const userLocation = await User.findById(user.id).select("location");
    console.log("ln 146 smp seriveces", userLocation);
    // 2. MID_DAY (12:00 PM) & MID_EVE (3:00 PM)
    if (action === "MID_DAY" || action === "MID_EVE") {
      const config = CHECKPOINT_WINDOWS[action];

      if (!isWithinWindow(now, config)) {
        throw createError(
          `${config.label} verification is only allowed between ${config.startHour}:${String(config.startMin).padStart(2, "0")} and ${config.endHour}:${String(config.endMin).padStart(2, "0")}`,
          400,
        );
      }

      if (existAtt[config.field]) {
        throw createError(`${config.label} already verified`, 400);
      }

      existAtt[config.field] = now;
      existAtt.history.push({
        action,
        status: existAtt.status,
        date: now,
        changedBy: user.id,
        reason: `${config.label} location verified`,
        location: userLocation?.location,
      });

      await existAtt.save();
      return { msg: `${config.label} verified`, attendance: existAtt };
    }

    if (action === "CHECK_OUT") {
      const totalHours = calcTotalHours(existAtt.checkInTime, now);

      existAtt.checkOutTime = now;
      existAtt.totalWorkingHours = totalHours > 0 ? totalHours : 0;
      existAtt.isAutoCheckout = false;

      existAtt.history.push({
        action: "CHECK_OUT",
        status: existAtt.status,
        date: now,
        changedBy: user.id,
        reason: "User CheckOut",
      });

      await existAtt.save();
      return { msg: "Marked Out", attendance: existAtt };
    }

    if (action === "MID_DAY" || action === "MID_EVE") {
      const config = CHECKPOINT_WINDOWS[action];

      if (!isWithinWindow(now, config)) {
        throw createError(
          `${config.label} is only allowed between ${formatWindowRange(config)}`,
          400,
        );
      }

      if (existAtt[config.field]) {
        throw createError(`${config.label} already marked for today`, 400);
      }

      existAtt[config.field] = now;
      existAtt.history.push({
        action, // "MID_DAY" or "MID_EVE"
        status: existAtt.status,
        date: now,
        changedBy: user.id,
        reason: `${config.label} verified`,
        location: userLocation?.location,
      });

      await existAtt.save();
      return {
        msg: `${config.label} marked successfully`,
        attendance: existAtt,
      };
    }

    throw createError("Invalid action type", 400);
  },

  attendenceAssign: async function ({ body, user }) {
    const { id, status = "Present", reason = "Administrative update" } = body;
    const privilegedRoles = ["operator", "admin"];
    const isPrivileged = privilegedRoles.includes(user.role);

    if (id && id !== user.id && !isPrivileged) {
      throw createError(
        "You don't have rights to mark attendance for other users",
        401,
      );
    }

    const targetUserId = isPrivileged && id ? id : user.id;

    const targetUser =
      await User.findById(targetUserId).select("firstname active");
    if (!targetUser) throw createError("User not found", 404);
    if (!targetUser.active) throw createError("User not Active", 400);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendence.findOne({
      user: targetUser._id,
      createdAt: { $gte: startOfDay },
    });

    let updatedAttendance;

    if (!existingAttendance) {
      updatedAttendance = await Attendence.create({
        user: targetUser._id,
        status: status,
        checkInTime: status !== "Absent" ? new Date() : null,
        history: [
          {
            status: status,
            action: "STATUS_CHANGE",
            date: new Date(),
            changedBy: user.id,
            reason,
          },
        ],
      });
    } else {
      updatedAttendance = await Attendence.findOneAndUpdate(
        { _id: existingAttendance._id },
        {
          $set: { status },
          $push: {
            history: {
              status: status,
              action: "STATUS_CHANGE",
              date: new Date(),
              changedBy: user.id,
              reason,
            },
          },
        },
        { new: true, runValidators: true },
      );
    }

    return { msg: `${targetUser?.firstname} is marked ${status}`, targetUser };
  },

  markActive: async function ({ params, user, body }) {
    const isActive = typeof body.status === "boolean" ? body.status : body;

    const exUser = await User.findByIdAndUpdate(
      params.id,
      {
        $set: { active: isActive },
      },
      { new: true, returnDocument: "after", runValidators: true },
    );
    if (!exUser) throw createError("User not found", 404);

    return {
      msg: `${exUser.firstname} has marked ${exUser.active ? "Active" : "InActive"}`,
      user: exUser.active,
    };
  },

  getAttendence: async (currentUser) => {
    const populateOptions = [
      { path: "dutyRecords" },
      {
        path: "attendenceRecords",
        populate: {
          path: "history.changedBy",
          select: "firstname lastname",
          options: { strictPopulate: false },
        },
      },
    ];
    const singleUser = await User.findById(currentUser.id)
      .populate(populateOptions)
      .select(
        "firstname middlename lastname attendence attendenceRecords updatedAt duty",
      );

    if (!singleUser) {
      throw createError("User not found", 404);
    }

    if (currentUser && ["operator", "admin"].includes(currentUser.role)) {
      const allUsers = await User.find({})
        .populate(populateOptions)
        .select(
          "firstname middlename lastname attendence attendenceRecords updatedAt",
        );

      return { success: true, user: singleUser, users: allUsers };
    }

    return { success: true, user: singleUser };
  },

  getCoOrdinates: async ({ coords, id }) => {
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { "location.coordinates": coords },
      },
      { runValidators: true, returnDocument: true },
    );
    if (!user) throw createError("user not found", 404);
    return {
      success: true,
      location: user.location,
      user: { id: user._id, name: `${user.firstname} ${user.lastname}` },
    };
  },

  getAdvances: async ({ date, limit = 12, page = 1, search }) => {
    const matchQuery = {};

    if (date) {
      const { startOfDay, endOfDay } = startEndDate(date);
      matchQuery["advance.date"] = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      matchQuery.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const result = await User.aggregate([
      { $unwind: "$advance" },
      {
        $lookup: {
          from: "users",
          localField: "advance.givenBy",
          foreignField: "_id",
          pipeline: [{ $project: { firstname: 1, lastname: 1, role: 1 } }],
          as: "advance.givenBy",
        },
      },
      {
        $unwind: { path: "$advance.givenBy", preserveNullAndEmptyArrays: true },
      },
      ...(Object.keys(matchQuery).length ? [{ $match: matchQuery }] : []),
      { $sort: { "advance.date": -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: Number(limit) }],
        },
      },
    ]);

    const users = await User.find({})
      .select("firstname middlename lastname role advance email phone")
      .lean();

    const { data = [], metadata = [] } = result[0] || {};
    const total = metadata[0]?.total || 0;

    return {
      users,
      advances: data.map((doc) => ({
        userId: doc._id,
        employeeName: `${doc.firstname || ""} ${doc.lastname || ""}`.trim(),
        email: doc.email,
        ...doc.advance,
      })),
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    };
  },

  markCheckout: async (userId) => {
    if (!userId) throw new Error("User ID is required for checkout");

    const { endOfDay, startOfDay } = startEndDate();

    const att = await Attendence.findOne({
      user: userId,
      status: { $in: ["Present", "Half-day"] },
      checkInTime: { $ne: null },
      checkOutTime: null,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!att) {
      throw createError("User not checked-in  today.");
    }

    const checkOutTime = new Date();
    const totalWorkingHours = calcTotalHours(att.checkInTime, checkOutTime);

    att.checkOutTime = checkOutTime;
    att.totalWorkingHours = totalWorkingHours > 0 ? totalWorkingHours : 0;

    att.history.push({
      action: "CHECK_OUT",
      status: att.status,
      changedBy: userId,
      reason: "Manually checked out by operator",
      date: checkOutTime,
    });

    await att.save();
    return { success: true, msg: `user is Checked Out` };
  },
};

export default empServices;

export const dutyServices = {
  createDuty: async (data, reqUser) => {
    const userId = data.id || data.userId;
    const changedById = reqUser?._id || reqUser?.id;

    const user = await User.findById(userId);
    if (!user) throw createError("User not found", 404);

    const normalizedDate = data.date ? new Date(data.date) : null;
    const resolvedSite = data.site || null;
    const instruction = (data.instruction || "Be on Time").trim();

    // 1. Create a new Duty log record for this change
    const newDuty = await Duty.create({
      date: normalizedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      instruction,
      site: resolvedSite,
      user: user._id,
      changedBy: changedById,
    });

    if (!newDuty) throw createError("Duty not created", 400);

    // 2. Update default/current duty on User
    user.duty = {
      date: normalizedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      site: resolvedSite,
      instruction,
      updatedAt: new Date(),
    };
    if (resolvedSite) {
      user.site = resolvedSite;
    }
    await user.save();

    // 3. Notify employee via FCM across up to 3 registered devices
    const validDevices = Array.isArray(user.fcmTokens)
      ? user.fcmTokens.filter(
          (d) => d && typeof d.token === "string" && d.token.trim(),
        )
      : [];

    if (validDevices.length > 0) {
      try {
        const tokens = validDevices.map((d) => d.token);

        const response = await getMessaging().sendEachForMulticast({
          tokens,
          notification: {
            title: "Hello! Your Duty time has changed",
            body:
              instruction ||
              `Your duty shift is now ${data.startTime} - ${data.endTime}.`,
          },
          data: {
            dutyId: String(newDuty._id),
            date: String(data?.date || ""),
            startTime: String(data.startTime),
            endTime: String(data.endTime),
          },
        });

        if (response.failureCount > 0) {
          const invalidTokens = [];

          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const device = validDevices[idx];
              console.error(
                `Token error [${device?.deviceId || "unknown"}]:`,
                resp.error?.message,
              );
              if (
                resp.error?.code ===
                  "messaging/registration-token-not-registered" ||
                resp.error?.code === "messaging/invalid-registration-token"
              ) {
                invalidTokens.push(device.token);
              }
            }
          });

          if (invalidTokens.length > 0) {
            await User.updateOne(
              { _id: user._id },
              { $pull: { fcmTokens: { token: { $in: invalidTokens } } } },
            );
          }
        }
      } catch (err) {
        console.error("FCM Multicast error:", err);
      }
    }

    return {
      msg: "Duty has been created and assigned successfully",
      success: true,
      duty: newDuty,
    };
  },

  getDuty: async ({ date, id } = {}) => {
    const filter = {};

    if (id) {
      filter.user = id;
    }

    if (date) {
      const { startOfDay, endOfDay } = startEndDate(date);
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const duties = await Duty.find(filter)
      .populate({ path: "user", select: "firstname lastname role email phone" })
      .populate({ path: "site", select: "name address" })
      .sort({ startTime: 1 })
      .lean();

    return duties;
  },
};
