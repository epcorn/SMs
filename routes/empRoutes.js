import { Router } from "express";
import {
  attendenceAssign,
  getAttendence,
  getCoordinates,
  markAttendence,
} from "../controllers/empController.js";

const empRouter = Router();

empRouter.post("/mark", markAttendence);
empRouter.post("/attendence/assign", attendenceAssign);
empRouter.get("/attendence", getAttendence);
empRouter.patch("/location/coords", getCoordinates);

export default empRouter;
