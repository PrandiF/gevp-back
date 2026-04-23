import { GetCalendarClient } from "../integrations/google/calendarClient";
import { SPORTS_CALENDARS, Sport } from "../config/calendars";

const TIMEZONE = "America/Argentina/Buenos_Aires";

/* =====================================================
   CALENDARS
===================================================== */

export const getCalendarBySport = (sport: string) => {
  const key = sport as Sport;
  const calendar = SPORTS_CALENDARS[key];

  if (!calendar) {
    throw new Error("Deporte no válido");
  }

  return calendar;
};

export const getAllCalendars = () => {
  return SPORTS_CALENDARS;
};

/* =====================================================
   CREATE EVENT (GOOGLE)
===================================================== */

type CreateEventProps = {
  calendarId: string;
  title: string;
  start: string | Date;
  end: string | Date;
  recurrenceDay?: string;
  repeat: boolean;
};

export const createCalendarEvent = async ({
  calendarId,
  title,
  start,
  end,
  repeat,
  recurrenceDay,
}: CreateEventProps) => {
  const calendarClient = await GetCalendarClient();

  const startISO = start instanceof Date ? start.toISOString() : start;
  const endISO = end instanceof Date ? end.toISOString() : end;

  const event: any = {
    summary: title,
    start: {
      dateTime: startISO,
      timeZone: TIMEZONE,
    },
    end: {
      dateTime: endISO,
      timeZone: TIMEZONE,
    },
  };

  // ✅ recurrencia semanal
  if (repeat && recurrenceDay) {
    event.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${recurrenceDay}`];
  }

  console.log("📅 Creando evento en Google:", calendarId);

  const response = await calendarClient.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
};

/* =====================================================
   DELETE EVENT (SERIE COMPLETA)
===================================================== */

export const deleteCalendarEvent = async (
  calendarId: string,
  eventId: string,
) => {
  const calendarClient = await GetCalendarClient();

  console.log("🗑 Eliminando evento:", eventId, "en", calendarId);

  await calendarClient.events.delete({
    calendarId,
    eventId,
  });
};

/* =====================================================
   GET EVENTS FROM ONE CALENDAR
===================================================== */

export const getEventsFromCalendar = async (calendarId: string) => {
  const calendarClient = await GetCalendarClient();

  console.log("🔎 Buscando eventos en:", calendarId);

  const now = new Date();

  const response = await calendarClient.events.list({
    calendarId,

    // 🔥 CLAVE
    singleEvents: true,

    orderBy: "startTime",

    timeZone: TIMEZONE,

    // 🔥 ESTO TE FALTABA
    timeMin: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(), // -7 días
    timeMax: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60).toISOString(), // +60 días

    maxResults: 250,
  });

  const events =
    response.data.items?.filter(
      (event) =>
        event.status !== "cancelled" &&
        (event.start?.dateTime || event.start?.date),
    ) || [];

  console.log("✅ EVENTOS GOOGLE:", events.length);

  // 🔎 DEBUG FUERTE
  console.log(
    "📦 IDS:",
    events.map((e: any) => e.id),
  );

  return events;
};

/* =====================================================
   GET EVENTS BY SPORT
===================================================== */

export const getEventsBySport = async (sport: string) => {
  console.log("➡️ Buscando eventos por deporte:", sport);

  const calendar = getCalendarBySport(sport);

  return getEventsFromCalendar(calendar.calendarId);
};

/* =====================================================
   GET ALL EVENTS (MULTI CALENDAR)
===================================================== */

export const getAllEvents = async () => {
  console.log("➡️ Buscando TODOS los eventos");

  const calendars = Object.values(SPORTS_CALENDARS);

  const results = await Promise.all(
    calendars.map((calendar) => getEventsFromCalendar(calendar.calendarId)),
  );

  const allEvents = results.flat();

  console.log("📊 TOTAL EVENTOS:", allEvents.length);

  return allEvents;
};
