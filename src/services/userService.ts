import Usuario from "../models/usuario";
import { generateToken } from "../config/tokens.config";

const loginUser = async (
  username: string,
  password: string,
): Promise<{
  payload: {
    username: string;
    role: "entrenador" | "admin";
    deporte: string | null;
  };
  token: string;
}> => {
  try {
    console.log("🔐 LOGIN ATTEMPT:", username);

    const user = await Usuario.findOne({ where: { username } });

    if (!user) {
      console.log("❌ USER NOT FOUND");
      throw new Error("User does not exist");
    }

    console.log("👤 USER FOUND:", {
      username: user.username,
      role: user.role,
      deporte: user.deporte,
    });

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      console.log("❌ INVALID PASSWORD");
      throw new Error("Invalid password");
    }

    console.log("✅ PASSWORD OK");

    const payload = {
      username: user.username,
      role: user.role,
      deporte: user.deporte ?? null,
    };

    console.log("📦 PAYLOAD GENERATED:", payload);

    const token = generateToken(payload, "7d");

    console.log("🎟️ TOKEN GENERATED");

    return { payload, token };
  } catch (error: any) {
    console.log("🔥 LOGIN ERROR:", error.message);

    if (error.message === "User does not exist") {
      throw new Error("User does not exist");
    }
    if (error.message === "Invalid password") {
      throw new Error("Invalid password");
    }
    throw new Error("Error when trying to login user: " + error.message);
  }
};

const getUsers = async (): Promise<Usuario[]> => {
  try {
    const users = await Usuario.findAll();
    if (!users) throw new Error("Error users does not exists");
    return users;
  } catch (error) {
    throw new Error("Error when trying to login user:" + error);
  }
};

const deleteUser = async (id: number): Promise<void> => {
  try {
    const userDeleted = await Usuario.destroy({ where: { id } });

    if (userDeleted === 0) {
      throw new Error("User does not exist");
    }

    return;
  } catch (error) {
    throw new Error("Error when trying to delete user: " + error);
  }
};

export default { loginUser, getUsers, deleteUser };
