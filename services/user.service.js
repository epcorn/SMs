import { createError } from "../middleware/errorMiddleware.js";
import Attendence from "../models/attendenceModel.js";
import User from "../models/userModel.js";
import {
  // createRefreshToken,
  createToken,
  uploadToCloud,
} from "../utils/helperFunction.js";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
import { startEndDate } from "./emp.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userService = {
  loginUser: async (creds) => {

    const extUser = await User.findOne({ email: creds.email }).select(
      "+password",
    );

    
    if (!extUser) throw createError("User not found", 404);

    const validateUser = await extUser.comparePassword(creds.password);
    if (!validateUser) throw createError("credentials not matched", 401);

    const accessToken = await createToken(extUser);
    // const refreshToken = await createRefreshToken(extUser);

    // await User.updateOne(
    //   { _id: extUser._id },
    //   { $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } } },
    // );
    return {
      token: accessToken,
      // refreshToken,
      user: {
        id: extUser._id,
        name: extUser.name,
        email: extUser.email,
        role: extUser.role,
        photo: extUser.photo,
      },
    };
  },

  refreshSession: async (oldToken) => {
    if (!oldToken) throw createError("Unauthorized", 401);

    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      console.error("Refresh verify failed:", err.message);
      throw createError("Refresh token expired or invalid", 403);
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) {
      console.error("Refresh: user not found");
      throw createError("Forbidden", 403);
    }
    if (user.refreshTokens !== oldToken) {
      console.error("Refresh: token doesn't match the one in DB");
      throw createError("Forbidden", 403);
    }

    return { token: await createToken(user) };
  },

  createUser: async ({ creds }) => {
    console.log(creds.firstname);
    if (!creds.firstname && !creds?.email && !creds?.password)
      throw createError("No info provided", 400);
    const user = await User.findOne({ email: creds.email });
    if (user) throw createError("Employee already exists with this email", 409);

    const newUser = await User.create({
      ...creds,
      salaryHistory: creds.currentSalary
        ? [
            {
              amount: creds.currentSalary,
              incrementAmount: 0,
              reason: "Joining salary",
            },
          ]
        : [],
    });
    return { user: newUser, msg: "User created successfully" };
  },

  changePassword: async ({ body, user }) => {
    const creds = body;

    const exUser = await User.findById(user.id).select("+password");
    if (!exUser) throw createError("User not found", 404);

    const isMatch = await exUser.comparePassword(creds.password);
    if (isMatch) throw createError("Password not changed", 400);

    exUser.password = creds.password;
    await exUser.save();

    return { msg: "Password updated successfully" };
  },

  editUser: async (creds, id, reqUser) => {
    if (creds.advance) {
      const { advance: _, ...advanceData } = creds;
      const newAdvanceEntry = { ...advanceData, givenBy: reqUser.id };
      const emp = await User.findByIdAndUpdate(
        id,
        {
          $push: { advance: newAdvanceEntry },
        },
        { returnDocument: "after", runValidators: true },
      );
      return { msg: `Succeed by ${reqUser.id}` };
    }
    if (!creds || (!creds?.user && !creds.email))
      throw createError("Info not provide", 400);

    // delete creds.role;
    delete creds.password;
    delete creds.advance;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: creds },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    return {
      msg: "User Edited Successfully",
      user: updatedUser,
    };
  },

  getAllUsers: async (data = {}, me) => {
    const { name, email } = data;

    if (me.role === "employee") {
      const user = await User.findById(me.id).populate([
        { path: "attendenceRecords" },
        { path: "site" },
        {
          path: "advance.givenBy",
          select: "firstname lastname email role",
        },
      ]);
      if (!user) throw createError("User not found", 404);

      return user;
    }

    const query = {};

    if (name || email) {
      query.$or = [];
      if (name) {
        query.$or.push({ firstname: { $regex: name, $options: "i" } });
      }
      if (email) {
        query.$or.push({ email: { $regex: email, $options: "i" } });
      }
    }
    const limit = parseInt(data.limit) || 12;
    const page = parseInt(data.page) || 1;

    const skip = (page - 1) * limit;

    const [users, user, totalUsers] = await Promise.all([
      User.find(query)
        .populate([
          { path: "attendenceRecords" },
          { path: "site" },
          {
            path: "advance.givenBy",
            select: "firstname lastname email role",
          },
        ])
        .skip(skip)
        .limit(limit),
      User.findById(me.id),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return {
      success: true,
      pagination: {
        totalPages,
        page,
        limit,
        next: page < totalPages,
        prev: page > 1,
        totalUsers,
      },
      user,
      data: users,
    };
  },

  uploadFile: async (file) => {
    if (!file) {
      throw createError("No files uploaded", 400);
    }

    const cloudRes = await uploadToCloud({
      filePath: file.data,
      filename: file.name,
    });

    return {
      msg: "File uploaded successfully",
      filepath: cloudRes.secure_url,
    };
  },
  me: async ({ id }) => {
    const me = await User.findById(id)
      .select("firstname middlename lastname email role phone photo attendence")
      .populate({
        path: "attendenceRecords",
        options: {
          sort: { createdAt: -1 },
          perDocumentLimit: 2,
        },
      });
    return me;
  },
};

export default userService;

export const dashboardService = {
  dashboradStats: async (query, user) => {
    const { startOfDay: today, endOfDay: endOfToday } = startEndDate(
      query.date,
    );

    const [stats, totalUsers] = await Promise.all([
      Attendence.aggregate([
        { $match: { createdAt: { $gte: today, $lte: endOfToday } } },
        {
          $group: {
            _id: null,
            "Total Records": { $sum: 1 },
            "Total Present": {
              $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
            },
            "Total Absent": {
              $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
            },
            "Total HalfDay": {
              $sum: { $cond: [{ $eq: ["$status", "Half-day"] }, 1, 0] },
            },
            "Total CheckIns": {
              $sum: { $cond: [{ $ne: ["$checkInTime", null] }, 1, 0] },
            },
            "Total CheckOuts": {
              $sum: { $cond: [{ $ne: ["$checkOutTime", null] }, 1, 0] },
            },
            "Avg Working Hours": { $avg: "$totalWorkingHours" },
          },
        },
        {
          $project: {
            _id: 0,
            "Total Records": 1,
            "Total Present": 1,
            "Total Absent": 1,
            "Total HalfDay": 1,
            "Total CheckIns": 1,
            "Total CheckOuts": 1,
            "Avg Working Hours": { $round: ["$Avg Working Hours", 2] },
          },
        },
      ]),
      User.countDocuments({ role: { $ne: "admin" } }),
    ]);

    return {
      totalUsers,
      stats: stats[0] || {
        "Total Records": 0,
        "Total Present": 0,
        "Total Absent": 0,
        "Total HalfDay": 0,
        "Total CheckIns": 0,
        "Total CheckOuts": 0,
        "Avg Working Hours": 0,
      },
    };
  },
  dashboardUserStats: async (query, user) => {
    const { startOfDay: startOfToday, endOfDay: endOfToday } = startEndDate(
      query.date,
    );

    const employees = await User.find({  })
      .select("firstname middlename lastname role")
      .lean()
      .populate({
        path: "attendenceRecords",
        match: {
          createdAt: {
            $gt: startOfToday,
            $lt: endOfToday,
          },
        },
      });
    console.log(employees, startOfToday, endOfToday);
    
    const allPresent = [];
    const allAbsent = [];
    const allHalfday = [];
    const allCheckouts = [];

    employees?.forEach((emp) => {
      const todayRecord = emp?.attendenceRecords?.[0];

      const employeeData = {
        _id: emp?._id,
        firstname: emp?.firstname,
        middlename: emp?.middlename,
        lastname: emp?.lastname,
        role: emp?.role,
        ...(todayRecord || {}),
      };

      if (todayRecord?.status === "Absent") {
        allAbsent.push(employeeData);
      } else if (todayRecord?.status === "Present") {
        allPresent.push(employeeData);
      } else if (todayRecord?.status === "Half-day") {
        allHalfday.push(employeeData);
      }

      if (
        todayRecord &&
        todayRecord?.checkOutTime !== null &&
        todayRecord?.checkOutTime !== undefined
      ) {
        allCheckouts.push(employeeData);
      }
    });

    return { allPresent, allAbsent, allHalfday, allCheckouts };
  },

  monthlyAttendanceReport: async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();

    const firstDay = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    const daysInMonth = lastDay.getUTCDate();

    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const dayOf = (d) =>
      new Date(new Date(d).getTime() + IST_OFFSET_MS).getUTCDate();

    const users = await User.find()
      .select("attendenceRecords firstname lastname role")
      .populate({
        path: "attendenceRecords",
        match: { createdAt: { $gte: firstDay, $lte: lastDay } },
      })
      .lean();

    const headers = [
      "Employee",
      "Role",
      ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
      "TotalPresent",
      "TotalAbsent",
      "TotalHalfDay",
    ];

    const rows = users?.map((u) => {
      const row = { Employee: `${u?.firstname} ${u?.lastname}`, Role: u?.role };
      for (let i = 1; i <= daysInMonth; i++) row[i] = "";

      let present = 0,
        absent = 0,
        halfDay = 0;

      const records = [...(u?.attendenceRecords || [])].sort(
        (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt),
      );

      const byDay = {};
      for (const att of records) byDay[dayOf(att?.createdAt)] = att?.status;

      for (const [day, status] of Object.entries(byDay)) {
        row[day] = status;
        if (status === "Present") present++;
        else if (status === "Absent") absent++;
        else if (status === "Half-Day") halfDay++;
      }

      row.TotalPresent = present;
      row.TotalAbsent = absent;
      row.TotalHalfDay = halfDay;
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const label = `${firstDay.getUTCFullYear()}-${String(firstDay.getUTCMonth() + 1).padStart(2, "0")}`;
    return { excelBuffer, filename: `Monthly_Attendance_${label}.xlsx` };
  },
};
