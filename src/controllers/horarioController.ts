import { Request, Response } from "express";
import horarioService from "../services/horarioService";
import Horario from "../models/horario";

type HorarioProps = {
  dia: string;
  gimnasio: string;
  deporte: string;
  categoria: string;
  quienCarga: string;
  tipoActividad: string;
  start: Date;
  end: Date;
};

const createHorario = async (req: Request, res: Response) => {
  const user = req.user;
  console.log("🍪 COOKIES:", req.cookies);

  const {
    gimnasio,
    deporte,
    categoria,
    start,
    end,
    quienCarga,
    recurrence,
    tipoDeActividad,
  } = req.body;

  try {
    if (!user) {
      return res.status(401).send("No autorizado");
    }
    const nuevoHorario = await horarioService.createHorario(
      {
        gimnasio,
        deporte,
        categoria,
        quienCarga,
        start,
        end,
        recurrence,
        tipoDeActividad,
      },
      user,
    );

    return res.status(201).json({ horario: nuevoHorario });
  } catch (error) {
    console.log("Error al crear el horario", error);
    return res.status(409);
  }
};

const getHorarios = async (req: Request, res: Response) => {
  try {
    const response = await horarioService.getHorarios();

    if (!response || response.totalItems === 0) {
      return res.status(404).send("Horarios not found");
    } else {
      return res.status(200).send(response);
    }
  } catch (error) {
    console.log("Error al obtener los horarios", error);
    return res.status(500).send({ error: "Error al obtener los horarios" });
  }
};

// const getHorarioById = async (req: Request, res: Response) => {
//   try {
//     const response = await horarioService.getHorarioById(
//       parseInt(req.params.id),
//     );
//     if (!response) {
//       return res.status(400).send("Event not found");
//     } else {
//       return res.status(200).send(response);
//     }
//   } catch (error: any) {
//     return res.status(400).send({ error });
//   }
// };

// const editHorarioById = async (req: Request, res: Response) => {
//   try {
//     const response = await horarioService.editHorarioById(
//       parseInt(req.params.id),
//       req.body,
//     );
//     if (!response) {
//       return res.status(400).send("Horario not found");
//     } else {
//       return res.status(200).send(response);
//     }
//   } catch (error) {
//     console.log("Error al editar el horario solicitado", error);
//     return res.status(400).send({ error });
//   }
// };

const cancelarSerieCompleta = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    let { eventId } = req.params;

    console.log("🟥 Cancelando SERIE completa:", eventId);

    const baseId = eventId.includes("_") ? eventId.split("_")[0] : eventId;

    await horarioService.cancelarSerieCompleta(baseId);

    res.json({
      ok: true,
      message: "Serie eliminada correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando serie" });
  }
};
const cancelarInstance = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    console.log("🟧 Cancelando instancia Google:", eventId);

    /**
     * eventId viene así:
     * recurringEventId_20260310T190000Z
     */

    const parts = eventId.split("_");
    const instanceDate = parts.pop()!;
    const baseId = parts.join("_");

    await horarioService.cancelarInstance(eventId);

    res.status(200).json({
      ok: true,
      message: "Instancia cancelada en Google Calendar",
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export default {
  createHorario,
  getHorarios,

  // editHorarioById,
  cancelarSerieCompleta,
  cancelarInstance,
};
