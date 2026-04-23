import { Payload } from "../../config/tokens.config";

declare global {
  namespace Express {
    interface Request {
      user?: Payload;
    }
  }
}

export {};
