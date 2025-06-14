import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(_, response) {
  const pedingsMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pedingsMigrations);
}

async function postHandler(_, response) {
  const migratedMigrations = await migrator.runPedingMigrations();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }
  return response.status(200).json(migratedMigrations);
}
