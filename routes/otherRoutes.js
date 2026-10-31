import { Router } from "express";
import { sendNotification } from "../controllers/otherController.js";

const otherRouter = Router();

otherRouter.get("/notify", sendNotification);

export default otherRouter;
