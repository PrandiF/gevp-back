import { Router } from "express";
import usuarioRoutes from "./usuarioRoutes";
import horarioRoutes from "./horarioRoutes";

import calendarRoutes from "./calendarRoutes";

const router = Router();

router.use("/usuario", usuarioRoutes);
router.use("/horario", horarioRoutes);

router.use("/calendar", calendarRoutes);

export default router;
