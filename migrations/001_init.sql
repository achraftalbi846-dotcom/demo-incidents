-- Migration 001 : création de la table des incidents
CREATE TABLE IF NOT EXISTS incidents (
  id          SERIAL PRIMARY KEY,
  title       TEXT        NOT NULL,
  service     TEXT        NOT NULL,
  severity    TEXT        NOT NULL,  -- CRITICAL | MAJOR | MINOR
  status      TEXT        NOT NULL,  -- OPEN | ACK | RESOLVED
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents (created_at DESC);
