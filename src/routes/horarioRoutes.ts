import { Router } from "express";
import horarioController from "../controllers/horarioController";

const router = Router();

router
  .post("/", horarioController.createHorario)
  .get("/", horarioController.getHorarios)
  .get("/filter", horarioController.filterHorarios)
  .get("/:id", horarioController.getHorarioById)
  .put("/:id", horarioController.editHorarioById)
  .delete("/:id", horarioController.deleteHorarioById)
  .post("/disponibilidad", horarioController.verificarHorarioDisponible);

export default router;
