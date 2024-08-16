import { Router } from "express";
import eventoRoutes from "./eventoRoutes"
import usuarioRoutes from "./usuarioRoutes"

const router = Router()

router.use('/evento', eventoRoutes)
router.use('/usuario', usuarioRoutes)

export default router