import { createError } from "../middleware/errorMiddleware.js";
import Attendence from "../models/attendenceModel.js";
import User from "../models/userModel.js";

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
    if (!existAtt.active) {
      throw createError("User is not active", 400);
    }

    if (existAtt) throw createError("Already attendence marked for Today", 400);
  },

  attendenceAssign: async function ({ body, user }) {
    const { id, status = "Present" } = body;
    const privilegedRoles = ["operator", "admin"];
    const isPrivileged = privilegedRoles.includes(user.role);

    if (id && id !== user.id && !isPrivileged) {
      throw createError(
        "You don't have rights to mark attendance for other users",
        401,
      );
    }

    const targetUserId = isPrivileged && id ? id : user.id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser.active) throw createError("User not Active", 400);
    if (!targetUser) throw createError("User not found", 404);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Check if an attendance record already exists for today
    const existingAttendance = await Attendence.findOne({
      user: targetUser._id,
      createdAt: { $gte: startOfDay },
    });

    let updatedAttendance;

    if (!existingAttendance) {
      updatedAttendance = await Attendence.create({
        user: targetUser._id,
        status: status,
        createdAt: new Date(),
        history: [{ status: status, date: new Date(), changedBy: user.id }],
      });
    } else {
      updatedAttendance = await Attendence.findOneAndUpdate(
        { _id: existingAttendance._id },
        {
          $set: { status },
          $push: {
            history: {
              status: status,
              date: new Date(),
              changedBy: user.id,
            },
          },
        },
        { new: true, upsert: true, runValidators: true },
      );
    }

    await targetUser.save();

    return { msg: `${targetUser?.firstname} is marked ${status}`, targetUser };
  },

  markAttendance: async function ({ body, user }) {
    await this.existAttendence(user.id, null);

    const att = await Attendence.create({
      user: user.id,
      status: "Present",
      history: [{ status: "Present", changedBy: user.id }],
    });
    return { msg: `marked ${att.status}` };
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

    console.log(currentUser, singleUser);

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
};

export default empServices;
