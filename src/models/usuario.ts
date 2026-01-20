import { DataTypes, Model, Optional } from "sequelize";
import bcrypt from "bcrypt";
import db from "./database";

interface UsuarioAttributes {
  id?: number;
  username: string;
  password: string;
  salt?: string;
  role: "socio" | "admin";
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
  public role!: "socio" | "admin";
}

Usuario.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("socio", "admin"),
      allowNull: false,
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

Usuario.sync()
  .then(async () => {
    const count = await Usuario.count();
    if (count === 0) {
      const userToCreate: UsuarioCreationAttributes[] = [
        {
          username: "gevp",
          password: "gevp123",
          role: "socio",
        },
        {
          username: "departamento fisico",
          password: "jano3455",
          role: "admin",
        },
      ];
      const usersWithHashedPassword: UsuarioCreationAttributes[] =
        userToCreate.map((user) => {
          const salt = bcrypt.genSaltSync();
          const hashedPassword = bcrypt.hashSync(user.password, salt);
          return {
            ...user,
            salt: salt,
            password: hashedPassword,
          };
        });
      await Usuario.bulkCreate(usersWithHashedPassword);
      console.log("Default users created successfully.");
    }
  })
  .catch((error) => {
    console.error("Error creating users:", error);
  });

export default Usuario;
