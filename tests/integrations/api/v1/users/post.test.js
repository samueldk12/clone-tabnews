import database from "infra/database.js";
import orchestrator from "tests/orchastrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPedingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      await database.query({
        text: "INSERT INTO users (username,email, password) VALUES ($1,$2,$3);",
        values: ["felipedeschamps","samuel.arao@gmail.com","senha123"],
      })
      const users = await database.query("SELECT * FROM users;")
      console.log(users.rows);

      const response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
        },
      );

      expect(response.status).toBe(201);     
    });
  });
});
