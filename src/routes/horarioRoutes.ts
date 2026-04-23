import { Router } from "express";
import horarioController from "../controllers/horarioController";
import calendarController from "../controllers/calendarController";
import { authMiddleware } from "../utils/AuthMiddleware";

const router = Router();

router
  .post("/", authMiddleware, horarioController.createHorario)
  .get("/", authMiddleware, horarioController.getHorarios);
// .get("/filter", horarioController.filterHorarios)
// .get("/:id", horarioController.getHorarioById)
// .put("/:id", horarioController.editHorarioById);
// ✅ cancelar instancia individual
router.delete(
  "/serie/:eventId",
  authMiddleware,
  horarioController.cancelarSerieCompleta,
);
router.delete(
  "/instance/:eventId",
  authMiddleware,
  horarioController.cancelarInstance,
);

//calendar
router.get(
  "/calendario/:sport",
  authMiddleware,
  calendarController.getCalendarBySport,
);
router.get("/calendario", authMiddleware, calendarController.getAllCalendars);

export default router;
