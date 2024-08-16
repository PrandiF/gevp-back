import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import db from './database';

interface UsuarioAttributes {
  id?: number;
  username: string;
  password: string;
  salt?: string;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'username'> {}

class Usuario extends Model {
    hash(password: string, salt: string) {
      return bcrypt.hash(password, salt);
    }
    validatePassword(password: string) {
      return this.hash(password, this.salt).then(
          (newHash) => newHash === this.password
      );
    }
    public username!: string;
    public password!: string;
    public salt!: string;
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
    salt: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: db,
    modelName: 'usuarios',
    timestamps: false,
  }
);

Usuario.sync()
  .then(async () => {
    const count = await Usuario.count();
    if (count === 0) {
      const userSuperAdminToCreate: UsuarioCreationAttributes[] = [
        {
          username: 'gevp',
          password: 'g123',
        },
      ];
      const usersWithHashedPassword: UsuarioCreationAttributes[] = userSuperAdminToCreate.map((user) => {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(user.password, salt);
        return {
          ...user,
          salt: salt,
          password: hashedPassword,
        };
      });
      await Usuario.bulkCreate(usersWithHashedPassword);
      console.log('Default user super admin created successfully.');
    }
  })
  .catch((error) => {
    console.error('Error creating super admin:', error);
  });

export default Usuario;
