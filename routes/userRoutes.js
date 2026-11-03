import { Router } from "express";
import {
  changePassword,
  createUser,
  editUser,
  getAllUsers,
  getMe,
  handleRefresh,
  uploadController,
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/me", getMe);
userRouter.get("/all", getAllUsers);

userRouter.post("/add", createUser);
userRouter.post("/edit/:id", editUser);
userRouter.post("/refresh", handleRefresh);
userRouter.post("/upload", uploadController);
userRouter.post("/changepassword", changePassword);

export default userRouter;
