import { Router } from "express";
import {
  changePassword,
  createUser,
  editUser,
  getAllUsers, uploadController
} from "../controllers/userController.js";

const userRouter = Router();

userRouter.post("/add", createUser);
userRouter.post("/changepassword", changePassword);
userRouter.post("/edit/:id", editUser);
userRouter.get("/all", getAllUsers);
userRouter.post("/upload", uploadController);

export default userRouter;
