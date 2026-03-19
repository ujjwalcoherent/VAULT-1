import { Pool } from "pg"

// Aiven uses self-signed certs — allow them for database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let pool: Pool | null = null

function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    })
  }
  return pool
}

export async function query(text: string, params?: unknown[]) {
  const p = getPool()
  if (!p) {
    console.warn("DATABASE_URL not set. Using mock data.")
    return { rows: [] }
  }
  return p.query(text, params)
}

export async function testConnection() {
  const p = getPool()
  if (!p) return { connected: false, error: "DATABASE_URL not set" }

  try {
    const result = await p.query("SELECT NOW() as time, current_database() as db")
    return { connected: true, ...result.rows[0] }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    return { connected: false, error: msg }
  }
}

export async function listTables() {
  const p = getPool()
  if (!p) return []

  const result = await p.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  )
  return result.rows.map((r: { table_name: string }) => r.table_name)
}
