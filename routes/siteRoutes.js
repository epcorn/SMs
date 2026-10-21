import { Router } from "express";
import { createSite, getSites } from "../controllers/siteController.js";

const siteRouter = Router();

siteRouter.post("/create", createSite);
siteRouter.get("/", getSites);

export default siteRouter;
