import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchastrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPedingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const newUser = await orchestrator.createUser({
        username: "MesmoCase",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCase",
        email: newUser.email,
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test("With miss case match", async () => {
      const newUser = await orchestrator.createUser({
        username: "CaseDiferente",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseDiferente",
        email: newUser.email,
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test("With nonexisteny username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioinex",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username não foi encontrado no sistema.",
        action: "Verifique se o username foi digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
