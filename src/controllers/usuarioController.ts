import { Request, Response } from "express";
import userService from "../services/userService";
import { generateToken } from "../config/tokens.config";

const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    const { payload, token } = await userService.loginUser(username, password);

    const isProd = process.env.NODE_ENV === "prod";

    // 🍪 Cookie (para Chrome / flujo estándar)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd, // 🔥 obligatorio en producción
      sameSite: isProd ? "none" : "lax", // 🔥 clave para cross-domain
      path: "/",
    });

    // 📦 Response (para Safari fallback con Authorization header)
    return res.status(200).json({
      message: "User has been logged",
      role: payload.role,
      deporte: payload.deporte,
      token, // 👈 🔥 MUY IMPORTANTE (nuevo)
    });
  } catch (error: any) {
    if (error.message === "Invalid password") {
      return res.status(401).send("Invalid password");
    }

    if (error.message === "User does not exist") {
      return res.status(404).send("User does not exist");
    }

    return res
      .status(500)
      .send(`Error when trying to login user: ${error.message}`);
  }
};

// const entrenadorLogin = async (req: Request, res: Response) => {
//   try {
//     const { sport } = req.body;

//     if (!sport) {
//       return res.status(400).send("Sport is required");
//     }

//     const payload = {
//       username: "entrenador",
//       role: "entrenador" as const,
//       sport, // 👈 CLAVE
//     };

//     const token = generateToken(payload, "7d");

//     res.cookie("token", token, {
//       sameSite: "none",
//       httpOnly: true,
//       secure: true,
//       path: "/",
//     });

//     res.status(200).json({
//       message: "Entrenador logged",
//       role: payload.role,
//       sport: payload.sport,
//     });
//   } catch (error) {
//     res.status(500).send("Error when trying to login as entrenador");
//   }
// };

const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("token", {
    sameSite: "lax",
    httpOnly: true,
    secure: false,
    path: "/",
  });
  res.status(200).send("Cookies deleted");
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.status(200).send(users);
  } catch (e) {
    res.status(400).send(`Error when trying get users: ${e}`);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await userService.deleteUser(+id);
    res.sendStatus(201);
  } catch (e) {
    res.status(400).send(`Error when trying delete user: ${e}`);
  }
};

export default { loginUser, logoutUser, getUsers, deleteUser };
