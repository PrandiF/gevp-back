import { Op } from "sequelize";
import Horario from "../models/horario";

type HorarioProps = {
  dia: string;
  gimnasio: string;
  deporte: string;
  categoria: string;
  quienCarga: string;
  horarioInicio: string;
  horarioFin: string;
};

const verificarDisponibilidad = async (
  gimnasio: string,
  dia: string,
  horarioInicio: string,
  horarioFin: string
) => {
  try {
    const formatTime = (time: string) => time.slice(0, 5);

    const entrenamientoExistente = await Horario.findAll({
      where: {
        gimnasio,
        dia,
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

    return entrenamientoExistente.length > 0;
  } catch (error) {
    console.error("Error al verificar la disponibilidad del horario:", error);
    throw error;
  }
};

const createHorario = async (data: HorarioProps) => {
  try {
    const formatTime = (time: string) => time.slice(0, 5);

    const entrenamientoExistente = await verificarDisponibilidad(
      data.gimnasio,
      data.dia,
      formatTime(data.horarioInicio),
      formatTime(data.horarioFin)
    );

    if (entrenamientoExistente) {
      throw new Error("El horario ya está ocupado.");
    } else {
      const nuevoEntrenamiento = await Horario.create({ ...data });
      return nuevoEntrenamiento;
    }
  } catch (error) {
    console.error("Error al crear el entrenamiento:", error);
    throw error;
  }
};

const getHorarios = async () => {
  const { count, rows } = await Horario.findAndCountAll({
    order: [["gimnasio", "ASC"]],
  });

  return {
    totalItems: count,
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

const filterHorarios = async (filters: Partial<HorarioProps>) => {
  const whereClause: any = {};

  if (filters.gimnasio) {
    whereClause.gimnasio = { [Op.iLike]: `%${filters.gimnasio}%` };
  }
  if (filters.deporte) {
    whereClause.deporte = { [Op.iLike]: `%${filters.deporte}%` };
  }
  if (filters.dia) {
    whereClause.dia = { [Op.iLike]: `%${filters.dia}%` };
  }
  if (filters.categoria) {
    whereClause.categoria = { [Op.iLike]: `%${filters.categoria}%` };
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

  const rows = await Horario.findAll({
    where: whereClause,
    order: [["horarioInicio", "ASC"]],
  });

  return {
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
  verificarDisponibilidad,
};
