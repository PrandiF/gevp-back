import db from "./database";

import Horario from "./horario";
import HorarioInstancia from "./horarioInstancia";
import HorarioExcepcion from "./horarioExcepcion";

/**
 * Relaciones
 */

Horario.hasMany(HorarioInstancia, {
  foreignKey: "horarioId",
});

HorarioInstancia.belongsTo(Horario, {
  foreignKey: "horarioId",
});

export { db, Horario, HorarioInstancia, HorarioExcepcion };
