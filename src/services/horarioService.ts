import { Op } from "sequelize";
import Horario from "../models/horario";

type HorarioProps = {
  dia: string;
  gimnasio: string;
  deporte: string;
  categoria: string;
  horarioInicio: string;
  horarioFin: string;
};

const createHorario = async (data: HorarioProps) => {
  return await Horario.create({ ...data });
};

const getHorarios = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const { count, rows } = await Horario.findAndCountAll({
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

const getHorarioById = async (id: number) => {
  return await Horario.findOne({ where: { id } });
};

const editHorarioById = async (id: number, data: HorarioProps) => {
  const horario = await Horario.findOne({ where: { id } });
  if (!horario) throw new Error("Horario not found");
  return horario.update({ ...data });
};

const deleteHorarioById = async (id: number) => {
  const horario = await Horario.findOne({ where: { id } });
  if (!horario) throw new Error("Horario not found");
  await horario.destroy();
  return horario;
};

const filterHorarios = async (
  filters: Partial<HorarioProps>,
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
  if (filters.dia) {
    whereClause.dia = { [Op.iLike]: `%${filters.dia}%` };
  }
  // if (filters.categoria) {
  //   whereClause.categoria = { [Op.iLike]: `%${filters.categoria}%` };
  // }

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
  const { count, rows } = await Horario.findAndCountAll({
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
  createHorario,
  getHorarios,
  getHorarioById,
  editHorarioById,
  deleteHorarioById,
  filterHorarios,
};
