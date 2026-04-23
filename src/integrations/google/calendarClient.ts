import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

export const GetCalendarClient = async () => {
  const authClient = await auth.getClient();

  const calendar = google.calendar({
    version: "v3",
    auth: authClient as any, // 👈 fix typings googleapis
  });

  return calendar;
};
