import { GetCalendarClient } from "./calendarClient";

const TIMEZONE = "America/Argentina/Buenos_Aires";

type UpdateCalendarEventProps = {
  calendarId: string;
  eventId: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  recurrence?: string[]; // opcional, para eventos recurrentes
};

export async function updateCalendarEvent({
  calendarId,
  eventId,
  title,
  start,
  end,
  recurrence,
}: UpdateCalendarEventProps) {
  const calendar = await GetCalendarClient();

  const requestBody: any = {
    summary: title,
    start: {
      dateTime: start,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: end,
      timeZone: TIMEZONE,
    },
  };

  if (recurrence) {
    requestBody.recurrence = recurrence;
  }

  const response = await calendar.events.update({
    calendarId,
    eventId,
    requestBody,
  });

  return response.data;
}
