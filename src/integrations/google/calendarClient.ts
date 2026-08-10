import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

let serviceAccount;

if (process.env.NODE_ENV === "prod") {
  const serviceAccountRaw = process.env.GOOGLE_SERVICE_ACCOUNT;

  if (!serviceAccountRaw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT env variable");
  }

  serviceAccount = JSON.parse(serviceAccountRaw);
} else {
  const serviceAccountPath = path.join(
    process.cwd(),
    "google-service-account-dev.json",
  );

  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
}

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

export const GetCalendarClient = async () => {
  const authClient = await auth.getClient();

  return google.calendar({
    version: "v3",
    auth: authClient as any,
  });
};
