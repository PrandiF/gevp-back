import { DataTypes, Model } from "sequelize";
import db from "./database";

class Evento extends Model {}

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
      type: DataTypes.DATE,
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
    // hooks: {
    //   beforeSave: (poliza, options) => {
    //     actualizarEstado(poliza);
    //   },
    //   beforeUpdate: (poliza, options) => {
    //     actualizarEstado(poliza);
    //   },
    //   afterFind: (polizas, options) => {
    //     if (Array.isArray(polizas)) {
    //       polizas.forEach((poliza) => actualizarEstado(poliza));
    //     } else if (polizas) {
    //       actualizarEstado(polizas);
    //     }
    //   },
    // },
  }
);

// function actualizarEstado(poliza: any) {
//   const hoy = new Date();
//   if (poliza.estado !== "ANULADA") {
//     if (poliza.vigenciaFin < hoy) {
//       poliza.estado = "VENCIDA";
//     } else {
//       poliza.estado = "VIGENTE";
//     }
//   }
// }

export default Evento;
