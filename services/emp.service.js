import { createError } from "../middleware/errorMiddleware.js";
import Attendence from "../models/attendenceModel.js";
import User from "../models/userModel.js";
import { getDistanceInMeteres } from "../utils/helperFunction.js";

export const startEndDate = (date) => {
  const startOfDay = date ? new Date(date) : new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = date ? new Date(date) : new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

const empServices = {
  existAttendence: async (id) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // if (user && ["operator", "admin"].includes(user.role)) {
    //   return;
    // }

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
    const action = body.action;

    const existAtt = await this.existAttendence(user.id);
    await this.getcoords(user);

    if (action === "CHECK_OUT") {
      if (!existAtt)
        throw createError("No attendance record found for today", 404);
      if (!existAtt.checkInTime)
        throw createError("Invalid Attendance Action", 400);
      if (existAtt.checkOutTime) throw createError("Already Marked Out", 400);

      const diffMs = now - new Date(existAtt.checkInTime);
      const totalHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

      existAtt.checkOutTime = now;
      existAtt.totalWorkingHours = totalHours;

      // Provide status to satisfy schema requirement
      existAtt.history.push({
        action,
        status: existAtt.status,
        date: now,
        changedBy: user.id,
        reason: "User CheckOut",
      });

      await existAtt.save();
      return { msg: "Marked Out" };
    }

    if (action === "CHECK_IN") {
      if (existAtt)
        throw createError("Already attendance marked for Today", 400);

      const att = await Attendence.create({
        user: user.id,
        status: "Present",
        checkInTime: now,
        history: [
          {
            status: "Present",
            action,
            date: now,
            changedBy: user.id,
            reason: "User CheckIn",
          },
        ],
      });

      return { msg: `marked ${att.status}` };
    }

    throw createError("Invalid action type", 400);
  },
  // Admin / Operator attendance assignment
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
    const populateOptions = {
      path: "attendenceRecords",
      populate: {
        path: "history.changedBy",
        select: "firstname lastname",
        options: { strictPopulate: false },
      },
    };
    const singleUser = await User.findById(currentUser.id)
      .populate(populateOptions)
      .select(
        "firstname middlename lastname attendence attendenceRecords updatedAt",
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
};

export default empServices;
