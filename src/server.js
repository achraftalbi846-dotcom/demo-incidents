import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listIncidents,
  getIncident,
  createIncident,
  SEVERITIES,
  STATUSES,
} from './repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/api/incidents', async (req, res, next) => {
    try {
      const page = Number.parseInt(req.query.page ?? '1', 10);
      const pageSize = Number.parseInt(req.query.pageSize ?? '5', 10);

      const result = await listIncidents({
        severity: req.query.severity || undefined,
        status: req.query.status || undefined,
        page: Number.isNaN(page) ? 1 : page,
        pageSize: Number.isNaN(pageSize) ? 5 : pageSize,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/incidents/:id', async (req, res, next) => {
    try {
      const incident = await getIncident(Number.parseInt(req.params.id, 10));
      if (!incident) return res.status(404).json({ error: 'Incident introuvable' });
      res.json(incident);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/incidents', async (req, res, next) => {
    try {
      const { title, service, severity, status } = req.body ?? {};

      if (!title || !service) {
        return res.status(400).json({ error: 'title et service sont obligatoires' });
      }
      if (!SEVERITIES.includes(severity)) {
        return res.status(400).json({ error: `severity doit être ${SEVERITIES.join(', ')}` });
      }
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `status doit être ${STATUSES.join(', ')}` });
      }

      const created = await createIncident({ title, service, severity, status });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne' });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`Supervision incidents — http://localhost:${port}`);
  });
}
