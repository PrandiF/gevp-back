import { validateToken } from "../config/tokens.config";
import { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).send("No token provided");
    }

    const user = validateToken(token);

    // ⚠️ TypeScript no sabe que existe "user"
    (req as any).user = user;

    next();
  } catch {
    return res.status(401).send("Unauthorized");
  }
};
