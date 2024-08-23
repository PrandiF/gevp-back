import { Op } from "sequelize";
import Evento from "../models/evento";

type EventoProps = {
  gimnasio: string;
  deporte: string;
  nombreSocio: string;
  evento: string;
  fecha: Date;
  quienCarga: string;
  horarioInicio: string;
  horarioFin: string;
};

const verificarDisponibilidad = async (
  gimnasio: string,
  fecha: Date,
  horarioInicio: string,
  horarioFin: string
) => {
  try {
    const formatTime = (time: string) => time.slice(0, 5); // Extrae HH:mm

    const eventoExistente = await Evento.findAll({
      where: {
        gimnasio,
        fecha,
        [Op.and]: [
          {
            horarioInicio: {
              [Op.lt]: formatTime(horarioFin), // El nuevo evento comienza antes de que el existente termine
            },
          },
          {
            horarioFin: {
              [Op.gt]: formatTime(horarioInicio), // El nuevo evento termina después de que el existente comience
            },
          },
        ],
      },
    });

    return eventoExistente.length > 0; // Devuelve true si hay eventos existentes, indicando que el horario está ocupado
  } catch (error) {
    console.error("Error al verificar la disponibilidad del horario:", error);
    throw error;
  }
};

const createEvento = async (
  gimnasio: string,
  deporte: string,
  fecha: Date,
  nombreSocio: string,
  evento: string,
  quienCarga: string,
  horarioInicio: string,
  horarioFin: string
) => {
  try {
    // Asegúrate de que los horarios estén en formato HH:mm
    const formatTime = (time: string) => time.slice(0, 5); // Extrae HH:mm

    const eventoExistente = await verificarDisponibilidad(
      gimnasio,
      fecha,
      formatTime(horarioInicio),
      formatTime(horarioFin)
    );

    if (eventoExistente) {
      throw new Error("El horario ya está ocupado.");
    } else {
      const nuevoEvento = await Evento.create({
        gimnasio,
        deporte,
        fecha,
        nombreSocio,
        evento,
        quienCarga,
        horarioInicio: formatTime(horarioInicio),
        horarioFin: formatTime(horarioFin),
      });
      return nuevoEvento;
    }
  } catch (error) {
    console.error("Error al crear el evento:", error);
    throw error; // Lanza el error para manejarlo en el controlador
  }
};

const viewEventos = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const { count, rows } = await Evento.findAndCountAll({
    order: [["id", "ASC"]],
    offset: offset,
    limit: limit,
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
    pageSize: pageSize,
    data: rows,
  };
};

const viewEventoById = async (id: number) => {
  return await Evento.findOne({ where: { id } });
};

const editEventoById = async (id: number, data: EventoProps) => {
  const evento = await Evento.findOne({ where: { id } });
  if (!evento) throw new Error("Event not found");
  return evento.update({ ...data });
};

const deleteEventoById = async (id: number) => {
  const evento = await Evento.findOne({ where: { id } });
  if (!evento) throw new Error("Event not found");
  await evento.destroy();
  return evento;
};

const filterEventos = async (
  filters: Partial<EventoProps>,
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  const whereClause: any = {};

  // Filtros de texto
  if (filters.gimnasio) {
    whereClause.gimnasio = { [Op.iLike]: `%${filters.gimnasio}%` };
  }
  if (filters.deporte) {
    whereClause.deporte = { [Op.iLike]: `%${filters.deporte}%` };
  }
  if (filters.nombreSocio) {
    whereClause.nombreSocio = { [Op.iLike]: `%${filters.nombreSocio}%` };
  }
  if (filters.evento) {
    whereClause.evento = { [Op.iLike]: `%${filters.evento}%` };
  }

  // Filtro de fecha
  if (filters.fecha) {
    const startDate = new Date(`${filters.fecha}T00:00:00Z`);
    const endDate = new Date(`${filters.fecha}T23:59:59Z`);
    whereClause.fecha = { [Op.between]: [startDate, endDate] };
  }

  // Filtros de horario
  if (filters.horarioInicio && filters.horarioFin) {
    whereClause.horarioInicio = { [Op.gte]: filters.horarioInicio };
    whereClause.horarioFin = { [Op.lte]: filters.horarioFin };
  } else if (filters.horarioInicio) {
    whereClause.horarioInicio = { [Op.gte]: filters.horarioInicio };
  } else if (filters.horarioFin) {
    whereClause.horarioFin = { [Op.lte]: filters.horarioFin };
  }

  // Búsqueda y conteo de resultados
  const { count, rows } = await Evento.findAndCountAll({
    where: whereClause,
    order: [["id", "ASC"]],
    offset: offset,
    limit: limit,
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
    pageSize: pageSize,
    data: rows,
  };
};

export default {
  createEvento,
  viewEventos,
  viewEventoById,
  editEventoById,
  deleteEventoById,
  filterEventos,
  verificarDisponibilidad,
};
