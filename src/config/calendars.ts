export type Sport =
  | "Básquet"
  | "Cesto"
  | "Voley Masculino"
  | "Voley Femenino"
  | "Gimnasia Rítmica"
  | "No Federados"
  | "Otras Actividades";

export const SPORTS_CALENDARS: Record<
  Sport,
  { calendarId: string; color: string }
> = {
  Básquet: {
    calendarId:
      "03b884e5cce57d7332740f49cc420b4e35f0881c76059f9106ad2d675139df2b@group.calendar.google.com",
    color: "#0066CC",
  },
  Cesto: {
    calendarId:
      "9b582b388b4f8944f5b0500be3013d3863e299afafa145fe36df9ccc9afce09e@group.calendar.google.com",
    color: "#34A853",
  },
  "Voley Masculino": {
    calendarId:
      "25145c42a7ac9067998a2f21b2312b22c6a89cb99900deec02eabd3503da505a@group.calendar.google.com",
    color: "#FBBC05",
  },
  "Voley Femenino": {
    calendarId:
      "cb9232a5979f1574f9c6f346c973cb6552fe4111005b3500a4d4c335feb8e060@group.calendar.google.com",
    color: "#b68904ff",
  },
  "Gimnasia Rítmica": {
    calendarId:
      "c5a6653276e620da6442dec8b645262b89ddef4fa22b39b74b168e2649ad6325@group.calendar.google.com",
    color: "#9C27B0",
  },
  "No Federados": {
    calendarId:
      "8ee0f9c181b2b9e8b0873a0bbe67e37b218b3d21e15fc1fa5aff1cc2ddbe976b@group.calendar.google.com",
    color: "#F44336",
  },
  "Otras Actividades": {
    calendarId:
      "187bbc45717be46db7c30a1ef8ae4e187d508fded54af98569b957ad82edc357@group.calendar.google.com",
    color: "#00c0b3",
  },
};
