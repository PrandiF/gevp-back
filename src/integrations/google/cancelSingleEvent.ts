import { GetCalendarClient } from "./calendarClient";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export async function cancelSingleOccurrence({
  calendarId,
  instanceId,
}: {
  calendarId: string;
  instanceId: string;
}) {
  const calendar = await GetCalendarClient();

  await calendar.events.patch({
    calendarId,
    eventId: instanceId,
    requestBody: {
      status: "cancelled",
    },
  });
}
