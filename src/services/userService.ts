import Usuario from "../models/usuario";
import { generateToken } from "../config/tokens.config";

const loginUser = async (
  username: string,
  password: string
): Promise<{
  payload: { username: string; role: "socio" | "employee" };
  token: any;
}> => {
  try {
    const user = await Usuario.findOne({ where: { username } });
    if (!user) throw new Error("User does not exist");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const payload = {
      username: user.username,
      role: user.role,
    };
    const token = generateToken(payload, "7d");

    return { payload, token };
  } catch (error: any) {
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
