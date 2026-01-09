const jwt = require("jsonwebtoken");

interface Payload {
  username: string;
  role: "socio" | "employee";
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
