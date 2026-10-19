import { Router } from "express";
import {
  attendenceAssign,
  getAttendence,
  getCoordinates,
  markActive,
  markAttendence,
} from "../controllers/empController.js";

const empRouter = Router();

empRouter.post("/mark", markAttendence);
empRouter.post("/active/:id", markActive);
empRouter.post("/attendence/assign", attendenceAssign);
empRouter.get("/attendence", getAttendence);
empRouter.patch("/location/coords", getCoordinates);

export default empRouter;
