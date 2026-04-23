import { Router } from "express";
import calendarController from "../controllers/calendarController";

const router = Router();

router
  .get("/events", calendarController.getEvents)
  .get("/", calendarController.getAllCalendars)
  .get("/:sport", calendarController.getCalendarBySport);

export default router;
