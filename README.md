# Supervision des incidents — support de démo « IA agentique »

Petite application Node.js + PostgreSQL servant de terrain de jeu pour une démonstration
d'agent de développement (Claude Code) devant une audience technique.

**Le déroulé de la démo est dans [`DEMO.md`](./DEMO.md) — c'est le fichier à lire en premier.**

---

## Ce que contient le projet

| | |
|---|---|
| API REST | `GET /api/incidents` (filtres + pagination), `GET /api/incidents/:id`, `POST /api/incidents`, `GET /api/health` |
| IHM | Une page web sobre aux couleurs Orange, avec filtres et pagination |
| Base | PostgreSQL — locale via Docker, ou n'importe quelle base distante |
| Tests | `node:test` (natif, aucune dépendance) — 7 tests |
| CI | GitLab CI **et** GitHub Actions, avec un service PostgreSQL |

Pile technique volontairement légère : le but est que le pipeline tourne en moins d'une minute
devant l'audience, et qu'un développeur non-JavaScript suive quand même ce qui se passe.

---

## Démarrage rapide

```bash
npm install
docker compose up -d      # PostgreSQL local sur le port 5432
cp .env.example .env
npm run seed              # applique la migration + insère 24 incidents
npm start                 # http://localhost:3000
```

Lancer les tests :

```bash
DATABASE_URL=postgres://demo:demo@localhost:5432/incidents_test npm test
```

## Utiliser une base distante

Un point qui impressionne : brancher l'application sur une vraie base hébergée.
Créez une base gratuite chez **Neon**, **Supabase** ou **Railway**, puis :

```bash
# .env
DATABASE_URL=postgres://user:motdepasse@ep-xxxx.eu-central-1.aws.neon.tech/incidents?sslmode=require
```

Le TLS est activé automatiquement pour ces hébergeurs (voir `src/db.js`).
Lancez ensuite `npm run seed` pour initialiser le schéma à distance.

En CI, renseignez `DATABASE_URL` en variable de projet plutôt que d'utiliser le service PostgreSQL,
si vous voulez que le pipeline attaque lui aussi la base distante.

---

## ⚠️ Les bugs sont volontaires

Le dépôt est livré **cassé**, c'est le point de départ de la démo.
Ne les corrigez pas avant : c'est le travail de l'agent, devant l'audience.

**Bug 1 — pagination** (`src/repository.js`)
`const offset = page * pageSize` au lieu de `(page - 1) * pageSize`.
La page 1 saute les incidents les plus récents. **Deux tests échouent → pipeline rouge.**

**Bug 2 — filtre par gravité** (`src/repository.js`)
La comparaison `severity = $1` est sensible à la casse. L'IHM envoie `critical`,
la base stocke `CRITICAL` : le filtre ne renvoie jamais rien.
**Aucun test ne le couvre** — c'est un ticket remonté par le support, et l'agent devra
écrire lui-même le test de non-régression.

Cette répartition est délibérée : un bug détecté par les tests (l'agent le découvre seul)
et un bug décrit en langage naturel (l'agent doit le retrouver dans le code).

### Remettre le projet dans son état initial

Après une répétition, pour rejouer la démo :

```bash
git checkout main
git branch -D fix/filtre-gravite     # supprime la branche créée par l'agent
git push origin --delete fix/filtre-gravite
```

Gardez `main` toujours rouge : c'est votre état de départ.

---

## Structure

```
src/
  server.js        API Express et service des fichiers statiques
  repository.js    Accès aux données  ← les deux bugs sont ici
  db.js            Pool PostgreSQL (TLS auto pour les bases managées)
  public/          IHM
migrations/        SQL
scripts/seed.js    Migration + jeu de données
tests/             Suite node:test
```

---

## Par où commencer ?

1. **[`GUIDE-INSTALLATION.md`](./GUIDE-INSTALLATION.md)** — tout installer depuis zéro (Node, base de données, GitHub, Claude Code). À lire en premier si vous n'avez jamais utilisé Claude Code.
2. **[`WORKFLOW-GITHUB.md`](./WORKFLOW-GITHUB.md)** — le cycle Git complet avec l'agent : branche, dev, test, push, Pull Request, merge (avec la protection de branche).
3. **[`DEMO.md`](./DEMO.md)** — le déroulé minute par minute le jour de la présentation.
