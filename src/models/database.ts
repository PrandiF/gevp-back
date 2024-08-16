import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const db = new Sequelize({
  database: process.env.DB_NAME, 
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false,
});

export default db;