import { Router } from "express";
import {
  addDuty,
  attendenceAssign,
  getAdavances,
  getAttendence,
  getCoordinates,
  getDuties,
  getHolidays,
  markActive,
  markAttendence,
  markCheckout,
} from "../controllers/empController.js";

const empRouter = Router();

empRouter.post("/mark", markAttendence);
empRouter.post("/active/:id", markActive);
empRouter.post("/attendence/assign", attendenceAssign);
empRouter.post("/duty", addDuty);

empRouter.patch("/location/coords", getCoordinates);
empRouter.patch("/attendence/checkout/:id", markCheckout);

empRouter.get("/attendence", getAttendence);
empRouter.get("/holidays", getHolidays);
empRouter.get("/advance", getAdavances);
empRouter.get("/duty", getDuties);

export default empRouter;
