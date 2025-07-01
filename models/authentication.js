import { NotFoundError, UnauthorizedError } from "infra/errors.js";
import password from "models/password";
import user from "models/user.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "O email não confere.",
          action: "Verifique se os dados enviados estão corretos.",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPassowrdMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPassowrdMatch) {
      throw new UnauthorizedError({
        message: "As senhas não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
