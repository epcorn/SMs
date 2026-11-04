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
import { authentication } from "../middleware/authMiddleware.js";

const userRouter = Router();
userRouter.post("/refresh", handleRefresh);

userRouter.use(authentication)
userRouter.get("/me", getMe);
userRouter.get("/all", getAllUsers);

userRouter.post("/add", createUser);
userRouter.post("/edit/:id", editUser);
userRouter.post("/upload", uploadController);
userRouter.post("/changepassword", changePassword);

export default userRouter;
