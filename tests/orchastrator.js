import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPedingMigrations() {
  await migrator.runPedingMigrations();
}

async function createUser(userObject) {
  const safeUser = userObject || {};

  const newUser = await user.create({
    username:
      safeUser.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: safeUser.email || faker.internet.email(),
    password: safeUser.password || "validPasswordrd",
  });

  return newUser;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPedingMigrations,
  createUser,
};

export default orchestrator;
