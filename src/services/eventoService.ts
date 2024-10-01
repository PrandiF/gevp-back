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
    const formatTime = (time: string) => time.slice(0, 5);

    const eventoExistente = await Evento.findAll({
      where: {
        gimnasio,
        fecha,
        [Op.and]: [
          {
            horarioInicio: {
              [Op.lt]: formatTime(horarioFin),
            },
          },
          {
            horarioFin: {
              [Op.gt]: formatTime(horarioInicio),
            },
          },
        ],
      },
    });

    return eventoExistente.length > 0;
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
    const formatTime = (time: string) => time.slice(0, 5);

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
    throw error;
  }
};

const viewEventos = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const { count, rows } = await Evento.findAndCountAll({
    order: [["fecha", "ASC"]],
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

  if (filters.deporte) {
    whereClause.deporte = { [Op.iLike]: `%${filters.deporte}%` };
  }

  if (filters.gimnasio) {
    whereClause.gimnasio = { [Op.iLike]: `%${filters.gimnasio}%` };
  }

  if (filters.fecha) {
    whereClause.fecha = { [Op.eq]: filters.fecha };
  }

  if (filters.horarioInicio && filters.horarioFin) {
    whereClause.horarioInicio = { [Op.lte]: filters.horarioFin };
    whereClause.horarioFin = { [Op.gte]: filters.horarioInicio };
  } else if (filters.horarioInicio) {
    whereClause.horarioInicio = { [Op.lte]: filters.horarioInicio };
    whereClause.horarioFin = { [Op.gte]: filters.horarioInicio };
  } else if (filters.horarioFin) {
    whereClause.horarioInicio = { [Op.lte]: filters.horarioFin };
    whereClause.horarioFin = { [Op.gte]: filters.horarioFin };
  }

  const { count, rows } = await Evento.findAndCountAll({
    where: whereClause,
    order: [["fecha", "ASC"]],
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
