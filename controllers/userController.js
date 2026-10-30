import { createError } from "../middleware/errorMiddleware.js";
import userService, { dashboardService } from "../services/user.service.js";

const loginUser = async (req, res, next) => {
  try {
    console.log("login body", req.body);
    const { token, user } = await userService.loginUser(req.body);
    res.cookie("EMS_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ success: true, msg: "Logged in successfull", user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const data = await userService.changePassword(req);
    return res.status(200).json({ ...data });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("EMS_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers(req.query, req.user);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { user, msg } = await userService.createUser(req.body);
    return res.status(200).json({ user, msg });
  } catch (error) {
    console.log("error creating user", error);
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const msg = await userService.editUser(req.body, req.params.id, req.user);
    return res.status(200).json(msg);
  } catch (error) {
    console.log("error creating user", error);
    next(error);
  }
};

const uploadController = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw createError("No files were uploaded", 400);
    }

    const uploadedFiles = Object.values(req.files);
    const results = [];

    for (let file of uploadedFiles) {
      const resData = await userService.uploadFile(file);
      results.push(resData);
    }

    return res
      .status(200)
      .json({ msg: "Files uploaded successfully", results });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getDashboradStats = async (req, res, next) => {
  // if (req.user.role !== "admin") return;
  try {
    const stats = await dashboardService.dashboradStats(req.query, req.user);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
const getDashboradEmpStats = async (req, res, next) => {
  // if (req.user.role !== "admin") return;
  try {
    const stats = await dashboardService.dashboardUserStats(
      req.query,
      req.user,
    );
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  // if (req.user.role !== "admin") return;
  try {
    const me = await userService.me(req.user);
    res.status(200).json(me);
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  changePassword,
  logout,
  getAllUsers,
  createUser,
  editUser,
  uploadController,
  getDashboradStats,
  getDashboradEmpStats,
  getMe,
};
