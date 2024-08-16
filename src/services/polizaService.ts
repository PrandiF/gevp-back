import { Op } from "sequelize";
import Evento from "../models/evento";

type EventoProps = {
  gimnasio: string;
  deporte: string;
  nombreSocio: string;
  evento: string;
  fecha: Date;
  horarioInicio: string;
  horarioFin: string;
};

const verificarDisponibilidad = async (
  gimnasio: string,
  fecha: string,
  horarioInicio: string,
  horarioFin: string
) => {
  const startTime = new Date(`1970-01-01T${horarioInicio}:00Z`);
  const endTime = new Date(`1970-01-01T${horarioFin}:00Z`);

  const eventos = await Evento.findAll({
    where: {
      gimnasio,
      fecha,
      [Op.or]: [
        {
          horarioInicio: {
            [Op.between]: [startTime, endTime],
          },
        },
        {
          horarioFin: {
            [Op.between]: [startTime, endTime],
          },
        },
        {
          [Op.and]: [
            { horarioInicio: { [Op.lte]: startTime } },
            { horarioFin: { [Op.gte]: endTime } },
          ],
        },
      ],
    },
  });

  return eventos.length === 0; // true si está disponible, false si no lo está
};

const createEvento = async (
  gimnasio: string,
  deporte: string,
  fecha: string,
  nombreSocio: string,
  evento: string,
  horarioInicio: string,
  horarioFin: string
) => {
  const disponible = await verificarDisponibilidad(
    gimnasio,
    fecha,
    horarioInicio,
    horarioFin
  );

  if (!disponible) {
    throw new Error("El horario ya está ocupado.");
  }

  // Si está disponible, crea el evento
  const nuevoEvento = await Evento.create({
    gimnasio,
    deporte,
    fecha,
    nombreSocio,
    evento,
    horarioInicio,
    horarioFin,
  });

  return nuevoEvento;
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
  if (filters.horarioInicio && filters.horarioFin) {
    whereClause.horarioInicio = { [Op.gte]: filters.horarioInicio };
    whereClause.horarioFin = { [Op.lte]: filters.horarioFin };
  } else if (filters.horarioInicio) {
    whereClause.horarioInicio = { [Op.gte]: filters.horarioInicio };
  } else if (filters.horarioFin) {
    whereClause.horarioFin = { [Op.lte]: filters.horarioFin };
  }
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
