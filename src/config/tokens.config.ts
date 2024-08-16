const jwt = require("jsonwebtoken");

const generateToken = (payload:object, duration:string) => {
  const token = jwt.sign({ user: payload }, process.env.SECRET, {
    expiresIn: `${duration}`,
  });
  return token;
};

const validateToken = (token:string) => {
  return jwt.verify(token, process.env.SECRET);
};

export { generateToken, validateToken };