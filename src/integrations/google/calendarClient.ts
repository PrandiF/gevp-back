import { google } from "googleapis";

const serviceAccountRaw = process.env.GOOGLE_SERVICE_ACCOUNT;

if (!serviceAccountRaw) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT env variable");
}

const serviceAccount = JSON.parse(serviceAccountRaw);

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
