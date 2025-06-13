import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { createRouter } from "next-connect";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

async function getDefaultMigrationsOptions(dbClient, dryRun) {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    migrationsTable: "pgmigrations",
  };
}

async function getHandler(_, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pedingsMigrations = await migrationRunner(
      await getDefaultMigrationsOptions(dbClient, true),
    );
    dbClient.end();
    return response.status(200).json(pedingsMigrations);
  } finally {
    dbClient?.end();
  }
}

async function postHandler(_, response) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner(
      await getDefaultMigrationsOptions(dbClient, false),
    );
    dbClient.end();
    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    dbClient?.end();
  }
}
