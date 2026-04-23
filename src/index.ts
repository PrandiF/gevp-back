import express, { Request, Response } from "express";
import dotenv from "dotenv";
import db from "./models/database";
import routes from "./routes";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import { seedDefaultUsers, updateUsernames } from "./utils/UsersSeed";
import { initSocket } from "./socket/socketServer";

dotenv.config();
const app = express();

const PORT =
  process.env.NODE_ENV === "prod" ? process.env.PORT_PROD : process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "prod"
        ? ["https://gevp-front.vercel.app", "https://app.clubgevp.com"]
        : ["http://localhost:5173"],

    credentials: true,
  }),
);

app.use((req, _res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

app.use("/api", routes);

db.sync({ force: false }).then(async () => {
  console.log("✅ Database synced");

  if (process.env.RUN_UPDATE_USERNAMES === "true") {
    console.log("🔄 Running username updates...");
    await updateUsernames();
  }

  if (process.env.RUN_SEED_USERS === "true") {
    console.log("🌱 Running user seed...");
    await seedDefaultUsers();
  }

  const server = http.createServer(app);

  initSocket(server);

  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
