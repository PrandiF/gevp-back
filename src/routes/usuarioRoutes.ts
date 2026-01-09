import { Router } from "express";
import userController from "../controllers/usuarioController";

const router = Router();

router
  .get("/", userController.getUsers)
  .post("/login", userController.loginUser)
  .post("/socio", userController.socioLogin)
  .post("/logout", userController.logoutUser)
  .delete("/:id", userController.deleteUser);
export default router;
