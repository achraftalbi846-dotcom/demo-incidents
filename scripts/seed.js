import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, closePool } from '../src/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVICES = ['Livebox', 'Facturation', 'Portail Client', 'IPTV', 'Réseau Mobile'];
const TITLES = [
  'Latence élevée sur le portail',
  'Échec de synchronisation nocturne',
  'Timeout sur l’API de facturation',
  'Perte de session utilisateur',
  'Pic de 5xx sur la passerelle',
  'File de messages saturée',
  'Certificat TLS proche expiration',
  'Lenteur des requêtes SQL',
  'Panne du cache distribué',
  'Erreurs d’authentification SSO',
  'Débit dégradé en zone sud',
  'Job batch bloqué en attente',
];
const SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR'];
const STATUSES = ['OPEN', 'ACK', 'RESOLVED'];

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../migrations/001_init.sql'), 'utf8');
  await query(sql);
  console.log('✔ migration appliquée');
}

async function seed() {
  await query('TRUNCATE incidents RESTART IDENTITY');

  const rows = [];
  for (let i = 0; i < 24; i++) {
    rows.push([
      TITLES[i % TITLES.length],
      SERVICES[i % SERVICES.length],
      SEVERITIES[i % SEVERITIES.length],
      STATUSES[i % STATUSES.length],
      new Date(Date.now() - i * 3600 * 1000),
    ]);
  }

  for (const [title, service, severity, status, createdAt] of rows) {
    await query(
      `INSERT INTO incidents (title, service, severity, status, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
      [title, service, severity, status, createdAt]
    );
  }
  console.log(`✔ ${rows.length} incidents insérés`);
}

await migrate();
if (!process.argv.includes('--migrate-only')) await seed();
await closePool();
