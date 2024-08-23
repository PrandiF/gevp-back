import Usuario from "../models/usuario";
import {generateToken} from "../config/tokens.config"

const loginUser = async (username: string, password: string): Promise<{
    payload: {
        username: string;
        role: "admin" | "employee";
    };
    token: any;
}> => {
    try {
        const user = await Usuario.findOne({ where: { username } });
        if (!user) throw new Error("Error that user does not exist");
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) throw new Error("Invalid password");

        const payload = {
            username: user.username,
            role: user.role,
        };
        const token = generateToken(payload, "7d");

        console.log("Generated payload:", payload); // Verifica que el payload incluye el role correctamente

        return { payload, token };
    } catch (error) {
        throw new Error("Error when trying to login user:" + error);
    }
};


export default {loginUser}