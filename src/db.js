import pg from 'pg';
import 'dotenv/config';

const connectionString =
  process.env.DATABASE_URL || 'postgres://demo:demo@localhost:5432/incidents';

// Les bases managées (Neon, Supabase, Railway…) exigent TLS.
const needsSsl = /neon\.tech|supabase|railway|render\.com|sslmode=require/.test(
  connectionString
);

export const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
  max: 5,
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
