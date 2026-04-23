import { validateToken } from "../config/tokens.config";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🔥 cookie o fallback header (más robusto)
    const token =
      req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send("No token provided");
    }

    const user = validateToken(token);

    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).send("Unauthorized");
  }
};
