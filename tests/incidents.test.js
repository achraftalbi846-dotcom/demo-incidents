import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.js';
import { query, closePool } from '../src/db.js';

let server;
let base;

before(async () => {
  await query(`CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    service TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await query('TRUNCATE incidents RESTART IDENTITY');

  // 6 incidents, du plus récent au plus ancien : INC-1 … INC-6
  for (let i = 0; i < 6; i++) {
    await query(
      `INSERT INTO incidents (title, service, severity, status, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
      [
        `INC-${i + 1}`,
        'Portail Client',
        i === 0 ? 'CRITICAL' : 'MINOR',
        'OPEN',
        new Date(Date.now() - i * 60_000),
      ]
    );
  }

  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await closePool();
});

describe('API incidents', () => {
  test('le endpoint de santé répond', async () => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
  });

  test('le total reflète le nombre d’incidents en base', async () => {
    const res = await fetch(`${base}/api/incidents`);
    const body = await res.json();
    assert.equal(body.total, 6);
  });

  test('la première page renvoie les incidents les plus récents', async () => {
    const res = await fetch(`${base}/api/incidents?page=1&pageSize=2`);
    const body = await res.json();

    assert.equal(body.items.length, 2);
    assert.deepEqual(
      body.items.map((i) => i.title),
      ['INC-1', 'INC-2'],
      'la page 1 doit commencer au tout premier incident'
    );
  });

  test('la deuxième page enchaîne sans trou ni doublon', async () => {
    const res = await fetch(`${base}/api/incidents?page=2&pageSize=2`);
    const body = await res.json();

    assert.deepEqual(
      body.items.map((i) => i.title),
      ['INC-3', 'INC-4']
    );
  });

  test('le filtre par statut fonctionne', async () => {
    const res = await fetch(`${base}/api/incidents?status=OPEN`);
    const body = await res.json();
    assert.equal(body.total, 6);
  });

  test('le filtre par gravité est insensible à la casse', async () => {
    const res = await fetch(`${base}/api/incidents?severity=critical`);
    const body = await res.json();

    assert.equal(body.total, 1, 'le filtre doit matcher CRITICAL en base malgré la casse envoyée par l’IHM');
    assert.deepEqual(
      body.items.map((i) => i.title),
      ['INC-1']
    );
  });

  test('la création d’un incident retourne 201', async () => {
    const res = await fetch(`${base}/api/incidents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Test création',
        service: 'IPTV',
        severity: 'MAJOR',
        status: 'OPEN',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.title, 'Test création');
  });

  test('une gravité invalide est rejetée', async () => {
    const res = await fetch(`${base}/api/incidents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'X',
        service: 'IPTV',
        severity: 'URGENT',
        status: 'OPEN',
      }),
    });
    assert.equal(res.status, 400);
  });
});
