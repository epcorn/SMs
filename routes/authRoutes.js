import { Router } from "express";
import {
  changePassword,
  loginUser,
  logout,
} from "../controllers/userController.js";
import { operatorAccess } from "../middleware/authMiddleware.js";

const authRoute = Router();

authRoute.post("/login", loginUser);
authRoute.post("/logout", logout);
// authRoute.patch("/cp", operatorAccess, changePassword);

export default authRoute;
