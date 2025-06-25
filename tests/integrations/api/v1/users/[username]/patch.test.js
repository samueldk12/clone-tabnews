import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchastrator.js";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPedingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexisteny username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuarioinex",
        {
          method: "PATCH",
        },
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

    test("With duplicated 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "senha123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const updatedUser1Response = await fetch(
        "http://localhost:3000/api/v1/users/user1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user2",
          }),
        },
      );

      expect(updatedUser1Response.status).toBe(400);

      const updatedUser1ResponseBody = await updatedUser1Response.json();

      expect(updatedUser1ResponseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: "senha123",
        }),
      });

      expect(user2Response.status).toBe(201);

      const updatedUser1Response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      expect(updatedUser1Response.status).toBe(400);

      const updatedUser1ResponseBody = await updatedUser1Response.json();

      expect(updatedUser1ResponseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const updatedUser1Response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(updatedUser1Response.status).toBe(200);

      const responseBody = await updatedUser1Response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: "uniqueUser1@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const updatedUser1Response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(updatedUser1Response.status).toBe(200);

      const responseBody = await updatedUser1Response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail1",
        email: "uniqueEmail2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword1",
          email: "newPassword1@gmail.com",
          password: "senha123",
        }),
      });

      expect(user1Response.status).toBe(201);

      const updatedUser1Response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "senha1234",
          }),
        },
      );

      expect(updatedUser1Response.status).toBe(200);

      const responseBody = await updatedUser1Response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        responseBody.username,
      );

      const correctPassowrdMatch = await password.compare(
        "senha1234",
        userInDatabase.password,
      );

      expect(correctPassowrdMatch).toBe(true);
      const incorrectPassowrdMatch = await password.compare(
        "senha12345",
        userInDatabase.password,
      );

      expect(incorrectPassowrdMatch).toBe(false);
    });
  });
});
