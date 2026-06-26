import { GetCalendarClient } from "./calendarClient";

const TIMEZONE = "America/Argentina/Buenos_Aires";

type UpdateCalendarEventProps = {
  calendarId: string;
  eventId: string;
  title: string;
  start: string;
  end: string;
  recurrence?: string[];

  // NUEVO
  editMode?: "series" | "single";
};

export async function updateCalendarEvent({
  calendarId,
  eventId,
  title,
  start,
  end,
  recurrence,
  editMode = "series",
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

  // solamente las series tienen recurrencia
  if (editMode === "series" && recurrence) {
    requestBody.recurrence = recurrence;
  }

  if (editMode === "series") {
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody,
    });

    return response.data;
  }

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody,
  });

  return response.data;
}
