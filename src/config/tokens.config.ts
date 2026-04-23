const jwt = require("jsonwebtoken");

export interface Payload {
  username: string;
  role: "admin" | "entrenador";
  deporte?: string | null; // 👈 deporte es opcional porque el admin no lo tiene
}

const generateToken = (payload: Payload, duration: string): string => {
  const token = jwt.sign({ user: payload }, process.env.SECRET!, {
    expiresIn: `${duration}`,
  });
  return token;
};

const validateToken = (token: string): Payload => {
  const decoded = jwt.verify(token, process.env.SECRET!) as { user: Payload };
  return decoded.user;
};

export { generateToken, validateToken };
