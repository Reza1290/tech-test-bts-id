import mysql from "mysql2/promise";
import { env } from "../config/env";
import { logger } from "../logger/logger";

export const dbPool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true,
});

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const connection = await dbPool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (err) {
    logger.error({ err }, "Database connectivity check failed");
    return false;
  }
};
