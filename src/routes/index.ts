import { Router } from "express";
import eventoRoutes from "./eventoRoutes";
import usuarioRoutes from "./usuarioRoutes";
import horarioRoutes from "./horarioRoutes";

const router = Router();

router.use("/evento", eventoRoutes);
router.use("/usuario", usuarioRoutes);
router.use("/horario", horarioRoutes);

export default router;
