import { DataTypes, Model, Optional } from "sequelize";
import db from "./database";

// Define una interfaz para los atributos de tu modelo
interface EventoAttributes {
  id: number;
  gimnasio: string;
  deporte: string;
  fecha: Date;
  nombreSocio: string;
  evento: string;
  quienCarga: string;
  horarioInicio: string;
  horarioFin: string;
}

// Define una interfaz para la creación de un evento
interface EventoCreationAttributes extends Optional<EventoAttributes, "id"> {}

class Evento extends Model<EventoAttributes, EventoCreationAttributes>
  implements EventoAttributes {
  public id!: number;
  public gimnasio!: string;
  public deporte!: string;
  public fecha!: Date;
  public nombreSocio!: string;
  public evento!: string;
  public quienCarga!: string;
  public horarioInicio!: string;
  public horarioFin!: string;
}

Evento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gimnasio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deporte: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    nombreSocio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    evento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quienCarga: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    horarioInicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horarioFin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "eventos",
    timestamps: false,
  }
);

export default Evento;
