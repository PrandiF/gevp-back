import { Request, Response } from "express";
import horarioService from "../services/horarioService";

type HorarioProps = {
  dia: string;
  gimnasio: string;
  deporte: string;
  categoria: string;
  quienCarga: string;
  horarioInicio: string;
  horarioFin: string;
};
const verificarHorarioDisponible = async (req: Request, res: Response) => {
  const { gimnasio, dia, horarioInicio, horarioFin } = req.body;

  // Verifica que todos los campos necesarios estén presentes
  if (!gimnasio || !dia || !horarioInicio || !horarioFin) {
    return res.status(400).json({ message: "Faltan parámetros necesarios." });
  }

  try {
    // Verifica la disponibilidad del horario utilizando el servicio
    const entrenamientoExistente = await horarioService.verificarDisponibilidad(
      gimnasio,
      dia,
      horarioInicio,
      horarioFin
    );

    // Devuelve una respuesta basada en la disponibilidad del horario
    if (entrenamientoExistente) {
      return res
        .status(200)
        .json({ disponible: false, message: "El horario ya está ocupado." });
    } else {
      return res.status(200).json({ disponible: true });
    }
  } catch (error) {
    console.error("Error al verificar la disponibilidad del horario:", error);
    return res
      .status(500)
      .json({ message: "Error al verificar la disponibilidad del horario." });
  }
};

const createHorario = async (req: Request, res: Response) => {
  const {
    dia,
    gimnasio,
    deporte,
    categoria,
    horarioInicio,
    horarioFin,
    quienCarga,
  } = req.body;

  try {
    const nuevoHorario = await horarioService.createHorario({
      dia,
      gimnasio,
      deporte,
      categoria,
      quienCarga,
      horarioInicio,
      horarioFin,
    });

    return res.status(201).json({ horario: nuevoHorario });
  } catch (error) {
    console.log("Error al crear el horario", error);
    return res.status(409);
  }
};

const getHorarios = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5;

    const response = await horarioService.getHorarios(page, pageSize);
    if (!response) {
      return res.status(400).send("Horarios not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.log("Error al obtener los horarios", error);
    return res.status(400).send({ error });
  }
};

const getHorarioById = async (req: Request, res: Response) => {
  try {
    const response = await horarioService.getHorarioById(
      parseInt(req.params.id)
    );
    if (!response) {
      return res.status(400).send("Event not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error: any) {
    return res.status(400).send({ error });
  }
};

const editHorarioById = async (req: Request, res: Response) => {
  try {
    const response = await horarioService.editHorarioById(
      parseInt(req.params.id),
      req.body
    );
    if (!response) {
      return res.status(400).send("Horario not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.log("Error al editar el horario solicitado", error);
    return res.status(400).send({ error });
  }
};

const deleteHorarioById = async (req: Request, res: Response) => {
  try {
    const response = await horarioService.deleteHorarioById(
      parseInt(req.params.id)
    );
    if (!response) {
      return res.status(400).send("Horario not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.log("Error al editar el horario solicitado", error);
    return res.status(400).send({ error });
  }
};

const filterHorarios = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;
  try {
    const filters: Partial<HorarioProps> = {};
    if (req.query.dia) filters.dia = req.query.dia as string;
    if (req.query.gimnasio) filters.gimnasio = req.query.gimnasio as string;
    if (req.query.deporte) filters.deporte = req.query.deporte as string;
    if (req.query.categoria) filters.categoria = req.query.categoria as string;
    if (req.query.horarioFin)
      filters.horarioFin = req.query.horarioFin as string;
    if (req.query.horarioInicio)
      filters.horarioInicio = req.query.horarioInicio as string;

    console.log("horarios recibidos:", filters);
    const horarios = await horarioService.filterHorarios(
      filters,
      page,
      pageSize
    );
    res.status(200).send(horarios);
  } catch (error) {
    console.log("Error al filtrar horarios", error);
    return res.status(500).send({ error });
  }
};

export default {
  createHorario,
  getHorarios,
  getHorarioById,
  editHorarioById,
  deleteHorarioById,
  filterHorarios,
  verificarHorarioDisponible
};