import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

async function getDefaultMigrationsOptions(dbClient, dryRun) {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: resolve("infra", "migrations"),
    direction: "up",
    log: ()=>{},
    migrationsTable: "pgmigrations",
  };
}

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pedingsMigrations = await migrationRunner(
      await getDefaultMigrationsOptions(dbClient, true),
    );
    dbClient.end();
    return pedingsMigrations;
  } finally {
    dbClient?.end();
  }
}

async function runPedingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner(
      await getDefaultMigrationsOptions(dbClient, false),
    );

    return migratedMigrations;
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPedingMigrations,
};

export default migrator;
