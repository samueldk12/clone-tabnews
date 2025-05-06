import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'

export default async function status(req, res) {
  const defaultMigrationsOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join('infra','migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations'
  }

  if(req.method === "GET"){
    const pedingsMigrations = await migrationRunner(defaultMigrationsOptions)
    return res.status(200).json(pedingsMigrations);
  }else if(req.method === "POST"){
    const migratedMigrations = await migrationRunner(
      {
        ...defaultMigrationsOptions,
        dryRun: false
      }
    )
    if (migratedMigrations.length > 0){
      return res.status(201).json(migratedMigrations)
    }
    return res.status(200).json(migratedMigrations);
  }

  return res.status(405).end()
}

