import { Router } from "express";
import {
  changePassword,
  getDashboradEmpStats,
  getDashboradStats,
  loginUser,
  logout,
} from "../controllers/userController.js";
import { authentication, operatorAccess } from "../middleware/authMiddleware.js";

const authRoute = Router();

authRoute.post("/login", loginUser);
authRoute.post("/logout",authentication, logout);
// authRoute.patch("/cp", operatorAccess, changePassword);

//dashboard routes
const dashRoute = Router();

dashRoute.get("/stats", getDashboradStats);
dashRoute.get("/userStats", getDashboradEmpStats);

export { dashRoute };
export default authRoute;
