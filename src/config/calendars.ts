import dotenv from "dotenv";

dotenv.config();

export type Sport =
  | "Básquet"
  | "Cesto"
  | "Voley Masculino"
  | "Voley Femenino"
  | "Gimnasia Rítmica"
  | "No Federados"
  | "Otras Actividades";

const isProd = process.env.NODE_ENV === "prod";

export const SPORTS_CALENDARS: Record<
  Sport,
  { calendarId: string; color: string }
> = {
  Básquet: {
    calendarId: isProd
      ? (process.env.BASQUET_CALENDAR_ID_PROD as string)
      : (process.env.BASQUET_CALENDAR_ID_DEV as string),

    color: "#0066CC",
  },

  Cesto: {
    calendarId: isProd
      ? (process.env.CESTO_CALENDAR_ID_PROD as string)
      : (process.env.CESTO_CALENDAR_ID_DEV as string),
    color: "#34A853",
  },

  "Voley Masculino": {
    calendarId: isProd
      ? (process.env.VOLEYMASC_CALENDAR_ID_PROD as string)
      : (process.env.VOLEYMASC_CALENDAR_ID_DEV as string),
    color: "#FBBC05",
  },

  "Voley Femenino": {
    calendarId: isProd
      ? (process.env.VOLEYFEM_CALENDAR_ID_PROD as string)
      : (process.env.VOLEYFEM_CALENDAR_ID_DEV as string),
    color: "#b68904",
  },

  "Gimnasia Rítmica": {
    calendarId: isProd
      ? (process.env.GIMNASIA_CALENDAR_ID_PROD as string)
      : (process.env.GIMNASIA_CALENDAR_ID_DEV as string),
    color: "#9C27B0",
  },

  "No Federados": {
    calendarId: isProd
      ? (process.env.NOFEDERADOS_CALENDAR_ID_PROD as string)
      : (process.env.NOFEDERADOS_CALENDAR_ID_DEV as string),
    color: "#F44336",
  },

  "Otras Actividades": {
    calendarId: isProd
      ? (process.env.OTRASACTIV_CALENDAR_ID_PROD as string)
      : (process.env.OTRASACTIV_CALENDAR_ID_DEV as string),
    color: "#00C0B3",
  },
};
