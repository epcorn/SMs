import { Router } from "express";
import {
  changePassword,
  createUser,
  editUser,
  getAllUsers, getMe, uploadController
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/all", getAllUsers);
userRouter.get("/me", getMe);

userRouter.post("/add", createUser);
userRouter.post("/changepassword", changePassword);
userRouter.post("/edit/:id", editUser);
userRouter.post("/upload", uploadController);

export default userRouter;
