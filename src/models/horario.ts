import { DataTypes, Model, Optional } from "sequelize";
import db from "./database";

/* =========================
   TYPES
========================= */

interface HorarioAttributes {
  id: number;
  gimnasio: string;
  deporte: string;
  categoria: string;
  quienCarga: string;
  tipoDeActividad: string;
  start: Date;
  end: Date;
  googleEventId?: string | null;
  recurringEventId?: string | null;
  calendarId?: string | null;
  cancelado?: boolean;

  // ✅ NUEVO — excepciones de recurrencia
  cancelledDates: string[];
}

type HorarioCreationAttributes = Optional<
  HorarioAttributes,
  "id" | "googleEventId" | "recurringEventId" | "calendarId" | "cancelledDates"
>;

/* =========================
   MODEL
========================= */

class Horario
  extends Model<HorarioAttributes, HorarioCreationAttributes>
  implements HorarioAttributes
{
  public id!: number;
  public gimnasio!: string;
  public deporte!: string;
  public categoria!: string;
  public quienCarga!: string;
  public tipoDeActividad!: string;
  public start!: Date;
  public end!: Date;
  public googleEventId!: string | null;
  public recurringEventId!: string | null;
  public calendarId!: string | null;
  public cancelado!: boolean;

  // ✅ NUEVO
  public cancelledDates!: string[];
}

Horario.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    gimnasio: { type: DataTypes.STRING, allowNull: false },

    deporte: { type: DataTypes.STRING, allowNull: false },

    categoria: { type: DataTypes.STRING, allowNull: false },

    quienCarga: { type: DataTypes.STRING, allowNull: true },
    tipoDeActividad: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    start: { type: DataTypes.DATE, allowNull: false },

    end: { type: DataTypes.DATE, allowNull: false },

    googleEventId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID del evento padre en Google Calendar (serie)",
    },

    recurringEventId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID de recurrencia usado por Google para manejar instancias",
    },

    calendarId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cancelado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // ⭐⭐⭐ NUEVO CAMPO CLAVE ⭐⭐⭐
    cancelledDates: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: "Fechas canceladas individualmente (EXDATE)",
    },
  },
  {
    sequelize: db,
    modelName: "horarios",
    timestamps: false,
  },
);

export default Horario;
