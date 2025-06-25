import database from "infra/database.js";
import password from "models/password.js";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUserName(userInputValues.username);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `INSERT INTO users 
               (username,email, password) 
               VALUES 
               ($1,$2,$3)
               RETURNING 
                *
              `,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUniqueUserName(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
        UPDATE 
          users
        SET 
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE 
          id = $1 
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `SELECT email
            FROM users 
            WHERE LOWER(email) = LOWER($1)
          `,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputObject) {
  const hashedPassword = await password.hash(userInputObject.password);
  userInputObject.password = hashedPassword;
}

async function validateUniqueUserName(username) {
  const results = await database.query({
    text: `SELECT username
            FROM users 
            WHERE LOWER(username) = LOWER($1)
          `,
    values: [username],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function findOneByUsername(username) {
  const user = await runSelectQuery(username);

  return user;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `SELECT *
             FROM users 
             WHERE LOWER(username) = LOWER($1)
             LIMIT 1
            `,
      values: [username],
    });
    if (results.rowCount == 0) {
      throw new NotFoundError({
        message: "O username não foi encontrado no sistema.",
        action: "Verifique se o username foi digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
