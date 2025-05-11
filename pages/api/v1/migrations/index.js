import migrationRunner from 'node-pg-migrate'
import { join } from 'node:path'
import database from 'infra/database.js'

export default async function status(req, res) {
  const dbClient = await database.getNewClient()
 
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join('infra','migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations'
  }

  if(req.method === "GET"){
    const pedingsMigrations = await migrationRunner(defaultMigrationsOptions)
    await dbClient.end()
    return res.status(200).json(pedingsMigrations);
  }else if(req.method === "POST"){
    const migratedMigrations = await migrationRunner(
      {
        ...defaultMigrationsOptions,
        dryRun: false
      }
    )

    await dbClient.end()
  
    if (migratedMigrations.length > 0){
      return res.status(201).json(migratedMigrations)
    }
    return res.status(200).json(migratedMigrations);
  }else{
    await dbClient.end()
    return res.status(405).json({"METHOD NOT ALLOWED"})
  }

  return res.status(405).end()
}

