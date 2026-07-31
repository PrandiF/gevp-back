import { Op } from "sequelize";
import Horario from "../models/horario";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarBySport,
} from "../services/googleCalendarService";
import { updateCalendarEvent } from "../integrations/google/updateCalendarEvent";
import { cancelSingleOccurrence } from "../integrations/google/cancelSingleEvent";
import { buildDateTime } from "../utils/dateHelpers";
import { getIO } from "../socket/socketServer";
import { SPORTS_CALENDARS, Sport } from "../config/calendars";
import { GetCalendarClient } from "../integrations/google/calendarClient";
import { buildCancelEmail } from "../utils/mailHelper";
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

const CLUB_CALENDAR_ID =
  "4bf1d63d6be261a1a85ece62f7083d3a246abd16a77af7137b9f514d3c83eef1@group.calendar.google.com";

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
  const start = new Date(data.start);
  const end = new Date(data.end);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fecha u horario inválido");
  }

  if (start >= end) {
    throw new Error("El horario de inicio debe ser anterior al horario de fin");
  }

  if (user.role === "entrenador") {
    if (!user.deporte || data.deporte !== user.deporte) {
      throw new Error("No autorizado para este deporte");
    }
  }

  // ✅ USAR CALENDARIO SEGÚN DEPORTE
  const calendar = SPORTS_CALENDARS[data.deporte as Sport];

  if (!calendar) {
    throw new Error("Deporte inválido");
  }

  const calendarId = calendar.calendarId;

  const { startDateTime, endDateTime, googleDay } = buildDateTime(start, end);

  const googleEvent = await createCalendarEvent({
    calendarId,
    title: `${data.deporte} - ${data.categoria} (${data.gimnasio})`,
    start: new Date(startDateTime),
    end: new Date(endDateTime),
    repeat: data.recurrence,
    recurrenceDay: data.recurrence ? googleDay : undefined,
  });

  const cleanId = googleEvent?.id?.split("@")[0];

  const horario = await Horario.create({
    ...data,
    start,
    end,
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

  /**
   * ==========================================
   * VALIDACIÓN ENTRENADOR
   * ==========================================
   */

  if (user.role === "entrenador") {
    if (!user.deporte || horario.deporte !== user.deporte) {
      throw new Error("No autorizado");
    }
  }

  const start = new Date(data.start);
  const end = new Date(data.end);

  const { startDateTime, endDateTime, googleDay } = buildDateTime(start, end);

  const title = `${data.deporte} - ${data.categoria} (${data.gimnasio})`;

  /**
   * ==========================================
   * EDITAR UNA SOLA INSTANCIA
   * ==========================================
   */

  if (data.editMode === "single") {
    if (!data.instanceId) {
      throw new Error("Falta instanceId");
    }

    await updateCalendarEvent({
      calendarId: horario.calendarId!,
      eventId: data.instanceId,
      title,
      start: startDateTime,
      end: endDateTime,
      editMode: "single",
    });

    // La base guarda únicamente la serie.
    // Las instancias individuales viven en Google Calendar.
    const updatedInstance = await updateCalendarEvent({
      calendarId: horario.calendarId!,
      eventId: data.instanceId,
      title,
      start: startDateTime,
      end: endDateTime,
      editMode: "single",
    });

    return updatedInstance;
  }

  /**
   * ==========================================
   * EDITAR TODA LA SERIE
   * ==========================================
   */

  await updateCalendarEvent({
    calendarId: horario.calendarId!,
    eventId: horario.googleEventId!,
    title,
    start: startDateTime,
    end: endDateTime,
    recurrence: data.recurrence
      ? [`RRULE:FREQ=WEEKLY;BYDAY=${googleDay}`]
      : undefined,
    editMode: "series",
  });

  /**
   * ==========================================
   * ACTUALIZAR BASE DE DATOS
   * ==========================================
   */

  await horario.update({
    gimnasio: data.gimnasio,
    deporte: data.deporte,
    categoria: data.categoria,
    tipoDeActividad: data.tipoDeActividad,
    start,
    end,
  });

  return horario;
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
