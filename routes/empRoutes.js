import { Router } from "express";
import {
  attendenceAssign,
  getAdavances,
  getAttendence,
  getCoordinates,
  getHolidays,
  markActive,
  markAttendence,
} from "../controllers/empController.js";

const empRouter = Router();

empRouter.post("/mark", markAttendence);
empRouter.post("/active/:id", markActive);
empRouter.post("/attendence/assign", attendenceAssign);

empRouter.patch("/location/coords", getCoordinates);

empRouter.get("/attendence", getAttendence);
empRouter.get("/holidays", getHolidays);
empRouter.get("/advance", getAdavances);

export default empRouter;
