import database from "infra/database.js";

export default async function status(req, res) {
  const updateAt = new Date().toISOString();

  const databaseVersionResponse = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResponse.rows[0].server_version;

  const databaseMaxConnectionsResponse = await database.query(
    "SHOW max_connections;",
  );

  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResponse.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseUsedConnectionsResponse = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseUsedConnectionsValue = parseInt(
    databaseUsedConnectionsResponse.rows[0].count,
  );

  res.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseUsedConnectionsValue,
      },
    },
  });
}
