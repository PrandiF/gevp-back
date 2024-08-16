import { Request, Response } from "express";
import eventoService from "../services/polizaService";
// import { body, param, validationResult } from 'express-validator';

type EventoProps = {
  gimnasio: string;
  deporte: string;
  nombreSocio: string;
  evento: string;
  estado: string;
  fecha: Date;
  horarioInicio: string;
  horarioFin: string;
};

const createEvento = async (req: Request, res: Response) => {
  const {
    gimnasio,
    deporte,
    fecha,
    nombreSocio,
    evento,
    horarioInicio,
    horarioFin,
  } = req.body;

  try {
    const nuevoEvento = await eventoService.createEvento(
      gimnasio,
      deporte,
      fecha,
      nombreSocio,
      evento,
      horarioInicio,
      horarioFin
    );

    return res.status(201).json({ evento: nuevoEvento });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    return res.status(409);
  }
};

const viewEventos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5;

    const response = await eventoService.viewEventos(page, pageSize);
    if (!response) {
      return res.status(400).send("Events not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error: any) {
    return res.status(400).send({ error });
  }
};

const viewEventoById = async (req: Request, res: Response) => {
  try {
    const response = await eventoService.viewEventoById(
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

const editEventoById = async (req: Request, res: Response) => {
  try {
    const response = await eventoService.editEventoById(
      parseInt(req.params.id),
      req.body
    );
    if (!response) {
      return res.status(400).send("Evento not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error: any) {
    return res.status(400).send({ error });
  }
};

const deleteEventoById = async (req: Request, res: Response) => {
  try {
    const response = await eventoService.deleteEventoById(
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

const filterEventos = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 5;

  try {
    const filters: Partial<EventoProps> = {};
    if (req.query.gimnasio) filters.gimnasio = req.query.gimnasio as string;
    // if (req.query.deporte) filters.deporte = req.query.deporte as string;
    // if (req.query.nombreSocio) filters.nombreSocio = req.query.nombreSocio as string;
    // if (req.query.evento) filters.evento = req.query.evento as string;
    if (req.query.fecha) filters.fecha = new Date(req.query.fecha as string);
    if (req.query.horarioFin)
      filters.horarioFin = req.query.horarioFin as string;
    if (req.query.horarioInicio)
      filters.horarioInicio = req.query.horarioInicio as string;
    const Eventos = await eventoService.filterEventos(filters, page, pageSize);
    res.status(200).send(Eventos);
  } catch (error) {
    res.status(500).send("Error fetching Eventos");
  }
};

const verificarHorarioDisponible = async (req: Request, res: Response) => {
  const { gimnasio, fecha, horarioInicio, horarioFin } = req.body;

  try {
    const disponible = await eventoService.verificarDisponibilidad(
      gimnasio,
      fecha,
      horarioInicio,
      horarioFin
    );

    if (disponible) {
      return res.status(200).json({ disponible: true });
    } else {
      return res
        .status(409)
        .json({ disponible: false, message: "El horario ya está ocupado." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al verificar la disponibilidad del horario." });
  }
};

export default {
  createEvento,
  viewEventos,
  viewEventoById,
  editEventoById,
  deleteEventoById,
  filterEventos,
  verificarHorarioDisponible,
};
