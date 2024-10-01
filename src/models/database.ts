import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isProd = process.env.NODE_ENV === "prod";

let db: Sequelize;

if (isProd) {
  const connectionProd = process.env.DB_CONNECTION_INT;
  
  if (!connectionProd) {
    throw new Error("La cadena de conexión a la base de datos no está definida en producción.");
  }

  db = new Sequelize(connectionProd, {
    dialect: "postgres",
    logging: false,
  });

} else {
  const connectionDev = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
  };

  if (!connectionDev.database || !connectionDev.username || !connectionDev.password || !connectionDev.host) {
    throw new Error("Faltan configuraciones para la conexión a la base de datos en desarrollo.");
  }

  db = new Sequelize(connectionDev.database, connectionDev.username, connectionDev.password, {
    host: connectionDev.host,
    dialect: "postgres",
    logging: false,
  });
}

export default db;
