# Déroulé de la démo — 10 à 12 minutes

> Ce fichier est votre antisèche. Gardez-le ouvert sur un second écran.
> Les prompts à taper dans Claude Code sont dans les blocs `> …` — vous pouvez les copier-coller tels quels.

---

## Le principe

L'audience doit voir **trois choses**, dans cet ordre :

1. L'agent **comprend** un code qu'il n'a jamais vu.
2. L'agent **se corrige tout seul** quand un test échoue. ← *le moment fort*
3. L'agent **va au bout de la chaîne** : commit, push, pipeline vert.

Le point 2 est le cœur de la démo : c'est la boucle de votre diapo 3, en direct.
Ne le précipitez pas. Quand l'agent lance les tests et en voit échouer,
**arrêtez-vous et commentez** : « regardez, personne ne lui a dit que c'était cassé — il l'a vu tout seul. »

---

## Situation de départ (à annoncer à l'audience)

> « Voici une petite application de supervision d'incidents. Ce matin, deux choses ne vont pas :
> le pipeline est **rouge** depuis hier soir, et le support a remonté un ticket : *filtrer par gravité
> ne renvoie aucun résultat*. Je n'ai pas encore regardé le code. On va demander à un agent de s'en occuper. »

C'est vrai : le dépôt contient réellement deux bugs, et vous n'avez pas besoin de faire semblant.

---

## Préparation (à faire AVANT, pas devant l'audience)

```bash
docker compose up -d          # base locale (ou renseignez une base distante dans .env)
npm install
npm run seed                  # migration + 24 incidents de démo
npm start                     # http://localhost:3000
```

Vérifiez que tout est en place :

```bash
npm test                      # doit afficher : 5 pass, 2 fail
curl "localhost:3000/api/incidents?severity=critical"   # doit renvoyer une liste vide
```

Ouvrez à l'avance, dans des onglets séparés :
- l'application → http://localhost:3000
- la page des pipelines de votre dépôt GitLab/GitHub
- un terminal dans le dossier du projet, avec `claude` lancé

Poussez le projet sur une branche `main` et **laissez le pipeline tourner une fois** : il doit être rouge.
C'est votre point de départ visuel.

---

## ACTE 1 — L'agent comprend le code (≈ 2 min)

Montrez d'abord l'application à l'écran. Sélectionnez « Critique » dans le filtre, cliquez sur **Filtrer**.
→ Le tableau est vide. Le bug est là, devant tout le monde.

Puis dans Claude Code :

> Explique-moi en quelques lignes ce que fait ce projet, puis dis-moi pourquoi filtrer les incidents par gravité « critical » depuis l'interface ne renvoie aucun résultat.

**Ce qu'il faut commenter pendant qu'il travaille :**
- il liste les fichiers, il ouvre `repository.js`, il lit le HTML de l'IHM ;
- personne ne lui a dit où chercher ;
- il fait le lien entre l'IHM qui envoie `critical` en minuscules et la base qui stocke `CRITICAL`.

*Repli si l'agent est lent : c'est le bon moment pour rappeler la boucle de la diapo 3.*

---

## ACTE 2 — La correction et l'auto-correction (≈ 5 min) — LE MOMENT FORT

> Le pipeline est rouge et le support a ouvert le ticket INC-2043 : « le filtre par gravité ne renvoie rien ».
> Corrige les deux problèmes, ajoute un test de non-régression pour le filtre, et lance la suite de tests pour vérifier que tout passe.

**Ce qui va se passer :**

| Étape | Ce que fait l'agent | Ce que vous dites |
|---|---|---|
| 1 | Il lance `npm test` et voit 2 échecs sur la pagination | « Il commence par constater l'état réel, il ne me croit pas sur parole » |
| 2 | Il trouve `const offset = page * pageSize` | « La page 1 sautait les premiers incidents » |
| 3 | Il corrige en `(page - 1) * pageSize` | |
| 4 | Il corrige le filtre (comparaison insensible à la casse) | |
| 5 | Il écrit un nouveau test pour le filtre | « Il ne corrige pas seulement, il protège la correction » |
| 6 | Il relance les tests — **s'il en reste un rouge, il repart tout seul** | **« Voilà. C'est ça, un agent. »** ← marquez la pause |

**Si tout passe du premier coup** (ça arrive), provoquez la boucle vous-même — c'est encore plus convaincant :

> Ajoute aussi un endpoint `GET /api/stats` qui renvoie le nombre d'incidents par gravité, avec son test.

Un ajout de fonctionnalité déclenche presque toujours au moins une itération.

**Avant de continuer, faites le geste qui rassure la salle :**

> Montre-moi le diff de ce que tu as changé.

Et dites-le à voix haute : « je relis toujours le diff avant de valider — c'est la règle de la diapo 8. »

---

## ACTE 3 — Le workflow complet jusqu'au merge (≈ 4 min)

> Le détail de cet acte, avec la configuration de la protection de branche, est dans
> **[`WORKFLOW-GITHUB.md`](./WORKFLOW-GITHUB.md)**. Configurez-la avant : elle bloque le
> bouton « Merge » tant que la CI est rouge, et c'est le meilleur effet de la démo.

> Crée une branche `fix/filtre-gravite`, commit avec un message conventionnel qui référence INC-2043, et pousse-la.

Puis :

> Ouvre une Pull Request vers `main` avec `gh`. Décris le problème, la cause racine et la correction.

Basculez sur l'onglet GitHub. La PR est là, le pipeline démarre.

**Le moment à souligner :** le bouton **Merge** est **grisé** —
*« Required statuses must pass before merging »*.

> « Regardez : même si l'agent a écrit le code, il ne peut pas le merger.
> La CI est le juge de paix. Aucun agent ne contourne nos règles. »

Pendant que le pipeline tourne, revenez à l'application, rechargez, refiltrez sur « Critique » :
→ **les incidents s'affichent**. La page 1 montre bien les plus récents.

Le pipeline passe au **vert**. Le bouton Merge se débloque. **C'est vous qui cliquez dessus.**

Phrase de conclusion :

> « Rouge il y a dix minutes, vert maintenant, mergé dans `main`.
> Deux bugs corrigés, un test ajouté, une PR documentée.
> Je n'ai pas écrit une ligne de code — mais j'ai relu chaque ligne, et c'est moi qui ai cliqué sur Merge. »

---

## Bonus si vous avez du temps ou une question de la salle

| Demande | Prompt |
|---|---|
| Montrer une migration de base | `Ajoute une colonne "assignee" à la table incidents avec sa migration SQL, expose-la dans l'API et dans l'IHM.` |
| Montrer la revue de code | `Relis le code du repository comme un reviewer exigeant : sécurité, cas limites, injections SQL.` |
| Montrer la doc | `Mets à jour le README avec la documentation des endpoints de l'API.` |
| Montrer les perfs | `La liste sera lente avec 10 millions de lignes. Diagnostique et propose une solution.` |

---

## Gestion des risques

| Risque | Parade |
|---|---|
| Pas de réseau / API indisponible | **Enregistrez la démo en vidéo la veille** (`asciinema` ou capture d'écran) et gardez-la prête |
| L'agent part dans une mauvaise direction | Interrompez-le (Échap) et recadrez : c'est une démo honnête, et ça montre la bonne pratique n°4 « itérer » |
| Le pipeline est lent | Lancez l'acte 3 plus tôt, et commentez le diff pendant que la CI tourne |
| Trop long | Sautez l'acte 1, commencez directement à l'acte 2 |
| La base distante ne répond pas | Gardez `docker compose up -d` en secours et basculez `DATABASE_URL` |

**Répétez la démo au moins une fois en entier la veille.** Le déroulé exact n'est jamais identique
d'une fois sur l'autre — c'est justement le propre d'un agent — donc l'objectif de la répétition
n'est pas d'apprendre un script, mais de savoir quoi dire pendant les temps morts.

---

## Ce que l'audience doit retenir

Reliez explicitement la démo à vos diapos :

- **Diapo 3** — l'agent a bouclé : action → observation → correction.
- **Diapo 4** — c'était du debug, du test et de la pré-revue : nos tâches quotidiennes.
- **Diapo 7** — j'ai donné une tâche bornée, avec le contexte, et j'ai vérifié le diff.
- **Diapo 8** — rien n'est parti en prod sans que je le relise.
