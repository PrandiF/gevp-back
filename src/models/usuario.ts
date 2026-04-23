import { DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcrypt";
import db from "./database";

interface UsuarioAttributes {
  id?: number;
  username: string;
  password: string;
  salt?: string;
  role: "admin" | "entrenador";
  deporte?:
    | "Básquet"
    | "Cesto"
    | "Voley Masculino"
    | "Voley Femenino"
    | "Gimnasia Rítmica"
    | "No Federados"
    | "Otras Actividades"
    | null;
}

interface UsuarioCreationAttributes extends Optional<
  UsuarioAttributes,
  "username"
> {}

class Usuario extends Model {
  hash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  validatePassword(password: string) {
    return this.hash(password, this.salt).then(
      (newHash) => newHash === this.password,
    );
  }

  public username!: string;
  public password!: string;
  public salt!: string;
  public role!: "admin" | "entrenador";
  public deporte!:
    | "Básquet"
    | "Cesto"
    | "Voley Masculino"
    | "Voley Femenino"
    | "Gimnasia Rítmica"
    | "No Federados"
    | "Otras Actividades"
    | null;
}

Usuario.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "entrenador"),
      allowNull: false,
    },
    deporte: {
      type: DataTypes.ENUM(
        "Básquet",
        "Cesto",
        "Voley Masculino",
        "Voley Femenino",
        "Gimnasia Rítmica",
        "No Federados",
        "Otras Actividades",
      ),
      allowNull: true,
      validate: {
        deporteRequiredForEntrenador() {
          if (this.role === "entrenador" && !this.deporte) {
            throw new Error("El entrenador debe tener un deporte asignado");
          }
        },
      },
    },
    salt: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    modelName: "usuarios",
    timestamps: false,
  },
);

export default Usuario;
