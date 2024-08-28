import { Router } from "express";
import userController from "../controllers/usuarioController"

const router = Router()

router
    .post("/login", userController.loginUser)
    .post("/logout", userController.logoutUser)

export default router;