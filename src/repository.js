import { query } from './db.js';

export const SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR'];
export const STATUSES = ['OPEN', 'ACK', 'RESOLVED'];

/**
 * Liste paginée des incidents, avec filtres optionnels.
 *
 * @param {object} opts
 * @param {string} [opts.severity] filtre sur la gravité
 * @param {string} [opts.status]   filtre sur le statut
 * @param {number} [opts.page]     numéro de page, commence à 1
 * @param {number} [opts.pageSize] taille de page
 */
export async function listIncidents({
  severity,
  status,
  page = 1,
  pageSize = 5,
} = {}) {
  const conditions = [];
  const params = [];

  if (severity) {
    params.push(severity);
    conditions.push(`severity = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const offset = page * pageSize;

  params.push(pageSize);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const { rows } = await query(
    `SELECT id, title, service, severity, status, created_at
       FROM incidents
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const countParams = params.slice(0, conditions.length);
  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS total FROM incidents ${where}`,
    countParams
  );

  return { items: rows, total: countRows[0].total, page, pageSize };
}

export async function getIncident(id) {
  const { rows } = await query(
    `SELECT id, title, service, severity, status, created_at
       FROM incidents WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function createIncident({ title, service, severity, status }) {
  const { rows } = await query(
    `INSERT INTO incidents (title, service, severity, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, service, severity, status, created_at`,
    [title, service, severity, status]
  );
  return rows[0];
}
