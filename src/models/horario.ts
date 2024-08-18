import { DataTypes, Model } from "sequelize";
import db from "./database";

class Horario extends Model {}

Horario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gimnasio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deporte: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoria: {
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
    modelName: "horarios",
    timestamps: false,
  }
);

export default Horario;
