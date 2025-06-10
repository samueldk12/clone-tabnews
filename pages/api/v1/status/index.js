import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(req, res) {
  try {
    const updatedAt = new Date().toISOString();
    const postgresServerVersion = await database.query("SHOW server_version");
    const databaseVersion = postgresServerVersion.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections",
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    res.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    console.log(error);
    const publicErrorObject = new InternalServerError({
      cause: error,
    });
    res.status(publicErrorObject.statusCode).json(publicErrorObject);
  }
}

export default status;
