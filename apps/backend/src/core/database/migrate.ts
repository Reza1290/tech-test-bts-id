import fs from "node:fs";
import path from "node:path";
import { dbPool } from "./connection";
import { logger } from "../logger/logger";
import { RowDataPacket } from "mysql2/promise";

interface MigrationRow extends RowDataPacket {
  name: string;
}

const findMigrationsDir = (): string => {
  const possiblePaths = [
    path.resolve(__dirname, "../../../../../infra/database/migrations"),
    path.resolve(process.cwd(), "../../infra/database/migrations"),
    path.resolve(process.cwd(), "infra/database/migrations"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error("Migrations directory not found in candidate paths: " + possiblePaths.join(", "));
};

export const runMigrations = async (): Promise<void> => {
  try {
    const migrationsDir = findMigrationsDir();
    logger.info({ migrationsDir }, "Running database migrations from directory");

    // Ensure schema_migrations table exists
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Get already applied migrations
    const [rows] = await dbPool.query<MigrationRow[]>("SELECT name FROM schema_migrations");
    const appliedSet = new Set(rows.map((r) => r.name));

    // Read and sort migration files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let executedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        logger.debug({ migration: file }, "Migration already applied, skipping");
        continue;
      }

      logger.info({ migration: file }, "Applying migration");
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      // Split queries by semicolon if multiple statements
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await dbPool.query(statement);
      }

      await dbPool.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
      logger.info({ migration: file }, "Migration applied successfully");
      executedCount++;
    }

    logger.info({ executedCount, totalMigrations: files.length }, "Database migrations complete");
  } catch (error) {
    logger.error({ error }, "Error executing database migrations");
    throw error;
  }
};

// If run directly via CLI
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info("Migration runner finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      logger.fatal({ err }, "Migration runner failed.");
      process.exit(1);
    });
}
