import * as calendarService from "../services/googleCalendarService";
import { Request, Response } from "express";
import Horario from "../models/horario";

const getCalendarBySport = (req: Request, res: Response) => {
  try {
    const { sport } = req.params;

    const calendar = calendarService.getCalendarBySport(sport);

    res.json(calendar);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const getAllCalendars = (_req: Request, res: Response) => {
  const calendars = calendarService.getAllCalendars();
  res.json(calendars);
};

const getEvents = async (req: Request, res: Response) => {
  try {
    console.log("QUERY:", req.query);

    const { sport } = req.query;

    // =========================
    // 1️⃣ TRAER EVENTOS GOOGLE
    // =========================
    let googleEvents;

    if (sport) {
      console.log("➡️ Buscando eventos por deporte:", sport);
      googleEvents = await calendarService.getEventsBySport(sport as string);
    } else {
      console.log("➡️ Buscando TODOS los eventos");
      googleEvents = await calendarService.getAllEvents();
    }

    // =========================
    // 2️⃣ TRAER HORARIOS DB
    // =========================
    const horarios = await Horario.findAll();

    // mapa rapido por googleEventId
    const horarioMap = new Map(horarios.map((h) => [h.googleEventId, h]));

    // =========================
    // 3️⃣ MERGE GOOGLE + DB
    // =========================
    const enrichedEvents = googleEvents.map((event: any) => {
      // 🔥 match inteligente para recurrencias
      let horario =
        horarioMap.get(event.recurringEventId ?? "") ||
        horarioMap.get(event.id ?? "");

      // ✅ fallback cuando Google cambia IDs de instancias
      if (!horario) {
        horario = horarios.find(
          (h) =>
            event.summary &&
            h.deporte &&
            event.summary.toLowerCase().includes(h.deporte.toLowerCase()),
        );
      }

      // DEBUG (podés borrarlo después)
      if (!horario) {
        console.log("⚠️ Evento sin match DB:", {
          id: event.id,
          recurringEventId: event.recurringEventId,
          summary: event.summary,
        });
      }

      return {
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,

        // datos del club (DB)
        deporte: horario?.deporte ?? null,
        categoria: horario?.categoria ?? null,
        gimnasio: horario?.gimnasio ?? null,
        quienCarga: horario?.quienCarga ?? null,
      };
    });

    // =========================
    // 4️⃣ RESPUESTA FINAL
    // =========================
    res.json(enrichedEvents);
  } catch (error: any) {
    console.error("🔥 ERROR EN getEvents:");
    console.error(error);

    res.status(400).json({
      message: error?.message || "Unknown error",
    });
  }
};

export default {
  getCalendarBySport,
  getAllCalendars,
  getEvents,
};
