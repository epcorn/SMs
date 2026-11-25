import { createError } from "../middleware/errorMiddleware.js";
import User from "../models/userModel.js";
import userService, { dashboardService } from "../services/user.service.js";

const loginUser = async (req, res, next) => {
  try {
    const { token, user } = await userService.loginUser(req.body);

    res.cookie("EMS_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({ success: true, msg: "Logged in successfully", user });
  } catch (error) {
    next(error);
  }
};

const saveFCMToken = async (req, res, next) => {
  try {
    const cleanToken = req.body?.token?.trim();
    const cleanDeviceId = req.body?.deviceId?.trim();
    const { deviceName } = req.body;

    if (!cleanToken || !cleanDeviceId) {
      return res
        .status(400)
        .json({ success: false, msg: "Token and deviceId are required" });
    }

    // Must explicitly include +fcmTokens because select: false is set on schema
    const user = await User.findById(req.user.id).select("+fcmTokens");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Normalize any legacy entries and remove same token if stored under an old deviceId
    user.fcmTokens = (user.fcmTokens || [])
      .map((item, idx) => {
        if (typeof item === "string") {
          return {
            deviceId: `legacy_${idx + 1}`,
            token: item,
            deviceName: "Legacy Device",
            lastActive: new Date(0),
          };
        }
        return item;
      })
      .filter(
        (item) =>
          item &&
          item.deviceId &&
          item.token &&
          !(item.token === cleanToken && item.deviceId !== cleanDeviceId),
      );

    const existingIndex = user.fcmTokens.findIndex(
      (item) => item.deviceId === cleanDeviceId,
    );

    if (existingIndex > -1) {
      user.fcmTokens[existingIndex].token = cleanToken;
      if (deviceName) user.fcmTokens[existingIndex].deviceName = deviceName;
      user.fcmTokens[existingIndex].lastActive = new Date();
    } else {
      user.fcmTokens.push({
        deviceId: cleanDeviceId,
        token: cleanToken,
        deviceName: deviceName || "PWA Browser",
        lastActive: new Date(),
      });

      if (user.fcmTokens.length > 3) {
        user.fcmTokens.sort(
          (a, b) => new Date(b.lastActive) - new Date(a.lastActive),
        );
        user.fcmTokens = user.fcmTokens.slice(0, 3);
      }
    }

    await user.save();
    res.json({ ok: true, devicesCount: user.fcmTokens.length });
  } catch (e) {
    next(e);
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
  console.log(req.body?.deviceId || req.query?.deviceId);
  try {
    const deviceId = req.body?.deviceId || req.query?.deviceId;

    if (req.user?.id && deviceId) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { fcmTokens: { deviceId } },
      });
    }

    res.clearCookie("EMS_token", {
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    return res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    const { excelBuffer, filename } =
      await dashboardService.monthlyAttendanceReport();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    return res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export {
  loginUser,
  saveFCMToken,
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
