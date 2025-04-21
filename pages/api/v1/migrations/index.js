import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'

export default async function status(req, res) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join('infra','migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations'
  })
  res.status(200).json(migrations);
}

