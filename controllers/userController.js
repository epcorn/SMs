import { createError } from "../middleware/errorMiddleware.js";
import userService, { dashboardService } from "../services/user.service.js";

const loginUser = async (req, res, next) => {
  try {
    const { token, user } = await userService.loginUser(req.body);
    res.cookie("EMS_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    // res.cookie("EMS_Refresh_token", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res
      .status(200)
      .json({ success: true, msg: "Logged in successfull", user });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const handleRefresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.EMS_Refresh_token;

    const { token } = await userService.refreshSession(oldRefreshToken);

    // Issue the new short-lived access token cookie
    res.cookie("EMS_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res
      .status(200)
      .json({ success: true, msg: "Token refreshed successfully" });
  } catch (error) {
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
    const { user, msg } = await userService.createUser(req.body);
    return res.status(200).json({ user, msg });
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const msg = await userService.editUser(req.body, req.params.id, req.user);
    return res.status(200).json(msg);
  } catch (error) {
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
    console.error(error);
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

const getMonthlyAttandenceReport = async (req, res, next) => {
  try {
    const { excelBuffer, filename } = await dashboardService.monthlyAttendanceReport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    return res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  handleRefresh,
  changePassword,
  logout,
  getAllUsers,
  createUser,
  editUser,
  uploadController,
  getDashboradStats,
  getDashboradEmpStats,
  getMe,
  getMonthlyAttandenceReport,
};
