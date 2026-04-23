import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Usuario from "../models/usuario";

/**
 * 🔁 Mapeo de usernames nuevos → viejos
 * (solo necesario mientras estás migrando nombres)
 */
const usernameMap: Record<string, string[]> = {
  "basquet profesional": ["basquet gevp"],
  "cesto elite": ["cesto gevp"],
};

/**
 * Helper para traer usernames viejos
 */
function getOldUsernames(newUsername: string): string[] {
  return usernameMap[newUsername] || [];
}

/**
 * 🔄 Actualiza usernames (ejecutar primero)
 */
export async function updateUsernames() {
  const usernameChanges = [
    { old: "basquet gevp", new: "basquet profesional" },
    { old: "cesto gevp", new: "cesto elite" },
    // agregá más si necesitás
  ];

  for (const change of usernameChanges) {
    const user = await Usuario.findOne({
      where: { username: change.old },
    });

    if (!user) continue;

    const alreadyExists = await Usuario.findOne({
      where: { username: change.new },
    });

    if (!alreadyExists) {
      await user.update({ username: change.new });
      console.log(`🔄 Username updated: ${change.old} → ${change.new}`);
    } else {
      console.log(`⚠️ Username ya existe: ${change.new}`);
    }
  }
}

/**
 * 🌱 Seed principal (crea o actualiza usuarios)
 */
export async function seedDefaultUsers() {
  const users = [
    {
      username: "departamento fisico",
      password: "jano3455",
      role: "admin",
      deporte: null,
    },
    {
      username: "basquet profesional",
      password: "basquet1234",
      role: "entrenador",
      deporte: "Básquet",
    },
    {
      username: "cesto elite",
      password: "cesto1234",
      role: "entrenador",
      deporte: "Cesto",
    },
    {
      username: "voley fem gevp",
      password: "voley1234",
      role: "entrenador",
      deporte: "Voley Femenino",
    },
    {
      username: "voley masc gevp",
      password: "voley1234",
      role: "entrenador",
      deporte: "Voley Masculino",
    },
    {
      username: "gimnasia ritmica gevp",
      password: "gimnasia1234",
      role: "entrenador",
      deporte: "Gimnasia Rítmica",
    },
    {
      username: "no federados gevp",
      password: "nofederados1234",
      role: "entrenador",
      deporte: "No Federados",
    },
    {
      username: "otras actividades gevp",
      password: "otras1234",
      role: "entrenador",
      deporte: "Otras Actividades",
    },
  ];

  for (const user of users) {
    const possibleUsernames = [
      user.username,
      ...getOldUsernames(user.username),
    ];

    const existing = await Usuario.findOne({
      where: {
        username: {
          [Op.in]: possibleUsernames,
        },
      },
    });

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(user.password, salt);

    if (existing) {
      await existing.update({
        username: user.username, // 👈 asegura que se renombre también
        password: hashedPassword,
        salt,
        role: user.role,
        deporte: user.deporte,
      });

      console.log(`🔄 Updated: ${user.username}`);
    } else {
      await Usuario.create({
        ...user,
        password: hashedPassword,
        salt,
      });

      console.log(`✅ Created: ${user.username}`);
    }
  }
}

/**
 * 🚀 Ejecuta todo en orden correcto
 */
export async function seedAll() {
  await updateUsernames(); // 1. renombrar
  await seedDefaultUsers(); // 2. actualizar/crear
}
