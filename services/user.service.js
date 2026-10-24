import { createError } from "../middleware/errorMiddleware.js";
import User from "../models/userModel.js";
import { createToken, uploadToCloud } from "../utils/helperFunction.js";
import path from "path";
import { fileURLToPath } from "url";

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

    const token = await createToken(extUser);
    return {
      token,
      user: {
        id: extUser._id,
        name: extUser.name,
        email: extUser.email,
        role: extUser.role,
        photo: extUser.photo,
      },
    };
  },

  createUser: async (creds) => {
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

    const { password, ...data } = creds;
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
};

export default userService;
