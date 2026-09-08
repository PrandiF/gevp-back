import { Op } from "sequelize";
import Horario from "../models/horario";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getAllEvents,
  getCalendarBySport,
  getEventsBetweenDates,
} from "../services/googleCalendarService";
import { updateCalendarEvent } from "../integrations/google/updateCalendarEvent";
import { cancelSingleOccurrence } from "../integrations/google/cancelSingleEvent";
import { buildDateTime } from "../utils/dateHelpers";
import { getIO } from "../socket/socketServer";
import { SPORTS_CALENDARS, Sport } from "../config/calendars";
import { GetCalendarClient } from "../integrations/google/calendarClient";
import {
  buildCancelEmail,
  buildHorarioLiberadoEmail,
} from "../utils/mailHelper";
import { sendMail } from "../utils/sendEmailjs";

type HorarioProps = {
  start: Date;
  end: Date;
  gimnasio: string;
  deporte: string;
  categoria: string;
  quienCarga: string;
  tipoDeActividad: string;
};

type EditHorarioDTO = {
  gimnasio: string;
  deporte: string;
  categoria: string;
  tipoDeActividad: string;
  start: string | Date;
  end: string | Date;
  recurrence: boolean;

  editMode: "single" | "series";

  instanceId?: string;
};

type ScheduleData = {
  start: string | Date;
  end: string | Date;
};

const CLUB_CALENDAR_ID =
  "4bf1d63d6be261a1a85ece62f7083d3a246abd16a77af7137b9f514d3c83eef1@group.calendar.google.com";
/**
 * ==========================================
 * HELPERS
 * ==========================================
 */
const validatePermissions = (
  horario: Horario,
  user: {
    role: string;
    deporte?: string | null;
  },
) => {
  if (user.role === "entrenador") {
    if (!user.deporte || horario.deporte !== user.deporte) {
      throw new Error("No autorizado");
    }
  }
};

const buildGoogleTitle = ({
  deporte,
  categoria,
  gimnasio,
}: {
  deporte: string;
  categoria: string;
  gimnasio: string;
}) => {
  return `${deporte} - ${categoria} (${gimnasio})`;
};

const buildScheduleData = (data: ScheduleData) => {
  const start = new Date(data.start);
  const end = new Date(data.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fecha u horario inválido");
  }

  if (start >= end) {
    throw new Error("El horario de inicio debe ser anterior al horario de fin");
  }

  const { startDateTime, endDateTime, googleDay } = buildDateTime(start, end);

  return {
    start,
    end,
    startDateTime,
    endDateTime,
    googleDay,
  };
};

const editSingleInstance = async (
  horario: Horario,
  data: EditHorarioDTO,
  title: string,
  scheduleData: ReturnType<typeof buildScheduleData>,
) => {
  if (!data.instanceId) {
    throw new Error("Falta instanceId");
  }

  const calendarClient = await GetCalendarClient();

  const instance = await calendarClient.events.get({
    calendarId: horario.calendarId!,
    eventId: data.instanceId,
  });

  const updatedInstance = await updateCalendarEvent({
    calendarId: horario.calendarId!,
    eventId: data.instanceId,
    title,
    start: scheduleData.startDateTime,
    end: scheduleData.endDateTime,
    editMode: "single",
  });

  const oldStart = new Date(instance.data.start!.dateTime!);
  const oldEnd = new Date(instance.data.end!.dateTime!);

  // Extraer gimnasio desde el summary
  const match = instance.data.summary?.match(/\((.*?)\)$/);
  const oldGym = match?.[1] ?? "";

  const espacioLiberado =
    oldGym !== data.gimnasio ||
    oldStart.getTime() !== scheduleData.start.getTime() ||
    oldEnd.getTime() !== scheduleData.end.getTime();

  if (espacioLiberado) {
    await sendMail({
      to: [process.env.ADMIN_CALENDAR_EMAIL!, process.env.PATO_EMAIL!],
      subject: "Espacio liberado",
      html: buildHorarioLiberadoEmail({
        gimnasio: oldGym,
        deporte: horario.deporte,
        categoria: horario.categoria,
        tipoDeActividad: horario.tipoDeActividad,
        start: oldStart,
        end: oldEnd,
      }),
    });
  }

  return updatedInstance;
};

const editSeries = async (
  horario: Horario,
  data: EditHorarioDTO,
  title: string,
  scheduleData: ReturnType<typeof buildScheduleData>,
) => {
  const oldHorario = {
    gimnasio: horario.gimnasio,
    deporte: horario.deporte,
    categoria: horario.categoria,
    tipoDeActividad: horario.tipoDeActividad,
    start: new Date(horario.start),
    end: new Date(horario.end),
  };

  const espacioLiberado =
    oldHorario.gimnasio !== data.gimnasio ||
    oldHorario.start.getTime() !== scheduleData.start.getTime() ||
    oldHorario.end.getTime() !== scheduleData.end.getTime();
  await updateCalendarEvent({
    calendarId: horario.calendarId!,
    eventId: horario.googleEventId!,
    title,
    start: scheduleData.startDateTime,
    end: scheduleData.endDateTime,
    recurrence: data.recurrence
      ? [`RRULE:FREQ=WEEKLY;BYDAY=${scheduleData.googleDay}`]
      : undefined,
    editMode: "series",
  });

  await horario.update({
    gimnasio: data.gimnasio,
    deporte: data.deporte,
    categoria: data.categoria,
    tipoDeActividad: data.tipoDeActividad,
    start: scheduleData.start,
    end: scheduleData.end,
  });
  if (espacioLiberado) {
    await sendMail({
      to: [process.env.ADMIN_CALENDAR_EMAIL!, process.env.PATO_EMAIL!],
      subject: "Espacio liberado",
      html: buildHorarioLiberadoEmail(oldHorario),
    });
  }
  return horario;
};

const validateGymAvailabilityDB = async ({
  gimnasio,
  start,
  end,
  ignoreHorarioId,
}: {
  gimnasio: string;
  start: Date;
  end: Date;
  ignoreHorarioId?: number;
}) => {
  console.log({
    gimnasio,
    start,
    end,
    ignoreHorarioId,
  });
  const existingHorario = await Horario.findOne({
    where: {
      gimnasio,
      cancelado: false,

      ...(ignoreHorarioId && {
        id: {
          [Op.ne]: ignoreHorarioId,
        },
      }),

      [Op.and]: [
        {
          start: {
            [Op.lt]: end,
          },
        },
        {
          end: {
            [Op.gt]: start,
          },
        },
      ],
    },
  });

  console.log("Horario encontrado:", existingHorario);

  if (existingHorario) {
    throw new Error(
      "Ya existe una actividad en ese gimnasio para el horario seleccionado.",
    );
  }
};

const extractGymFromSummary = (summary: string) => {
  const match = summary.match(/\((.*?)\)$/);

  return match?.[1] ?? "";
};

const validateGymAvailability = async ({
  gimnasio,
  start,
  end,
  ignoreGoogleEventId,
  ignoreInstanceId,
}: {
  gimnasio: string;
  start: Date;
  end: Date;
  ignoreGoogleEventId?: string | null;
  ignoreInstanceId?: string;
}) => {
  const events = await getEventsBetweenDates(start, end);

  const overlappingEvent = events.find((event: any) => {
    const googleId = (event.recurringEventId ?? event.id)?.split("_")[0];

    if (ignoreGoogleEventId && googleId === ignoreGoogleEventId) {
      return false;
    }

    // Ignorar solo esta instancia
    if (ignoreInstanceId && event.id === ignoreInstanceId) {
      return false;
    }

    const eventGym = extractGymFromSummary(event.summary ?? "");

    if (eventGym !== gimnasio) {
      return false;
    }

    console.log({
      eventSummary: event.summary,
      eventGym,
    });

    const eventStart = new Date(event.start.dateTime ?? event.start.date);
    const eventEnd = new Date(event.end.dateTime ?? event.end.date);

    return start < eventEnd && end > eventStart;
  });
  console.log(
    events.map((e: any) => ({
      id: e.id,
      summary: e.summary,
      start: e.start.dateTime,
      end: e.end.dateTime,
    })),
  );
  if (overlappingEvent) {
    throw new Error(
      "Ya existe una actividad en ese gimnasio para el horario seleccionado.",
    );
  }
};

/**
 * ==========================================
 * FIN HELPERS
 * ==========================================
 */

const createHorario = async (
  data: {
    gimnasio: string;
    deporte: string;
    categoria: string;
    quienCarga: string;
    tipoDeActividad: string;
    start: Date | string;
    end: Date | string;
    recurrence: boolean;
  },
  user: { role: string; deporte?: string | null },
) => {
  // ✅ Construye y valida fechas
  const scheduleData = buildScheduleData(data);

  // ✅ Validar permisos
  if (user.role === "entrenador") {
    if (!user.deporte || data.deporte !== user.deporte) {
      throw new Error("No autorizado para este deporte");
    }
  }

  // ✅ Validar disponibilidad del gimnasio
  await validateGymAvailability({
    gimnasio: data.gimnasio,
    start: scheduleData.start,
    end: scheduleData.end,
  });

  // ✅ Obtener calendario
  const calendar = SPORTS_CALENDARS[data.deporte as Sport];

  if (!calendar) {
    throw new Error("Deporte inválido");
  }

  const calendarId = calendar.calendarId;

  // ✅ Crear evento en Google Calendar
  const googleEvent = await createCalendarEvent({
    calendarId,
    title: buildGoogleTitle(data),
    start: new Date(scheduleData.startDateTime),
    end: new Date(scheduleData.endDateTime),
    repeat: data.recurrence,
    recurrenceDay: data.recurrence ? scheduleData.googleDay : undefined,
  });

  const cleanId = googleEvent?.id?.split("@")[0];

  // ✅ Guardar en la base
  const horario = await Horario.create({
    ...data,
    start: scheduleData.start,
    end: scheduleData.end,
    googleEventId: cleanId,
    recurringEventId: googleEvent.recurringEventId ?? googleEvent.id,
    calendarId,
  });

  return horario;
};

const getHorarios = async () => {
  const horarios = await Horario.findAll({
    where: { cancelado: false },
    order: [["gimnasio", "ASC"]],
  });

  return {
    totalItems: horarios.length,
    data: horarios,
  };
};
const getHorarioByGoogleId = async (googleEventId: string) => {
  return await Horario.findOne({
    where: { googleEventId },
  });
};
const getHorarioById = async (id: string) => {
  return await Horario.findOne({ where: { id } });
};

const editHorario = async (
  id: string,
  data: EditHorarioDTO,
  user: {
    role: string;
    deporte?: string | null;
  },
) => {
  const horario = await Horario.findByPk(id);

  if (!horario) {
    throw new Error("Horario no encontrado");
  }

  validatePermissions(horario, user);

  const scheduleData = buildScheduleData(data);

  await validateGymAvailability({
    gimnasio: data.gimnasio,
    start: scheduleData.start,
    end: scheduleData.end,
    ignoreGoogleEventId:
      data.editMode === "series" ? horario.googleEventId : undefined,
    ignoreInstanceId: data.editMode === "single" ? data.instanceId : undefined,
  });

  const title = buildGoogleTitle(data);

  if (data.editMode === "single") {
    return editSingleInstance(horario, data, title, scheduleData);
  }

  return editSeries(horario, data, title, scheduleData);
};
const deleteEventFromAnyCalendar = async (eventId: string) => {
  const calendarClient = await GetCalendarClient();

  const calendars = Object.values(SPORTS_CALENDARS);

  for (const calendar of calendars) {
    try {
      await calendarClient.events.delete({
        calendarId: calendar.calendarId,
        eventId,
      });

      console.log("✅ Evento eliminado en:", calendar.calendarId);
      return true;
    } catch (err: any) {
      // 404 = no estaba en este calendario → seguimos buscando
      if (err.code !== 404) {
        throw err;
      }
    }
  }

  throw new Error("Evento no encontrado en ningún calendario");
};

export const cancelarSerieCompleta = async (googleEventId: string) => {
  const calendarClient = await GetCalendarClient();
  const calendars = Object.values(SPORTS_CALENDARS);

  const baseId = googleEventId.split("_")[0];

  console.log("🟥 Eliminando serie Google:", baseId);

  for (const calendar of calendars) {
    try {
      // ✅ 1. Obtener evento REAL de Google
      const event = await calendarClient.events.get({
        calendarId: calendar.calendarId,
        eventId: baseId,
      });

      // ✅ 2. Eliminar serie
      await calendarClient.events.delete({
        calendarId: calendar.calendarId,
        eventId: baseId,
      });

      console.log("✅ Serie eliminada en:", calendar.calendarId);

      // ✅ 3. Mail usando evento real
      await sendMail({
        to: [process.env.ADMIN_CALENDAR_EMAIL!, process.env.PATO_EMAIL!],
        subject: "Serie de entrenamiento cancelada",
        html: buildCancelEmail(event.data, "SERIE COMPLETA"),
      });

      // ✅ 4. Socket
      getIO().emit("horarioCancelado", { id: baseId });

      return true;
    } catch (err: any) {
      if (err.code !== 404) throw err;
    }
  }

  throw new Error("Evento no encontrado en ningún calendario");
};
const cancelarInstance = async (eventId: string) => {
  const calendarClient = await GetCalendarClient();

  const parts = eventId.split("_");
  const instanceDate = parts.pop()!;
  const baseId = parts.join("_");

  const instanceId = `${baseId}_${instanceDate}`;

  console.log("🧩 instanceId:", instanceId);

  // 🔥 buscar en DB el calendario correcto
  const horario = await Horario.findOne({
    where: { recurringEventId: baseId },
  });

  if (!horario || !horario.calendarId) {
    throw new Error("No se encontró el horario o calendarId");
  }

  const calendarId = horario.calendarId;

  console.log("📅 Usando calendarId:", calendarId);

  // ✅ 1. TRAER LA INSTANCIA REAL DE GOOGLE
  const instance = await calendarClient.events.get({
    calendarId,
    eventId: instanceId,
  });

  // ✅ 2. Cancelar instancia
  await calendarClient.events.patch({
    calendarId,
    eventId: instanceId,
    requestBody: {
      status: "cancelled",
    },
  });

  console.log("✅ Instancia cancelada:", instanceId);

  // ✅ 3. MAIL usando instancia real
  await sendMail({
    to: [process.env.ADMIN_CALENDAR_EMAIL!, process.env.PATO_EMAIL!],
    subject: "Instancia de entrenamiento cancelada",
    html: buildCancelEmail(instance.data, "INSTANCIA"),
  });

  // ✅ 4. SOCKET
  getIO().emit("horarioCancelado", {
    id: instanceId,
  });

  return true;
};
export default {
  createHorario,
  getHorarios,
  getHorarioById,
  editHorario,
  cancelarSerieCompleta,
  cancelarInstance,
  getHorarioByGoogleId,
};
