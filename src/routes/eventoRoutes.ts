import { Router } from "express";
import eventoController from "../controllers/eventoController";

const router = Router();

router
  .post("/", eventoController.createEvento)
  .get("/", eventoController.viewEventos)
  .get("/filter", eventoController.filterEventos)
  .get("/:id", eventoController.viewEventoById)
  .put("/:id", eventoController.editEventoById)
  .delete("/:id", eventoController.deleteEventoById)
  .post(
    "/disponibilidad",
    eventoController.verificarHorarioDisponible
  );

export default router;
