# Le workflow Git complet avec l'agent

Branche → développement → tests → push → Pull Request → merge.

C'est le cycle que votre audience connaît par cœur. Le montrer **en entier** est bien plus
convaincant que « l'agent a corrigé un bug » : ça prouve que l'agent s'insère dans un processus
professionnel existant, avec ses garde-fous, au lieu de le contourner.

---

## Le principe

| Étape | Qui fait quoi |
|---|---|
| 1. Créer la branche | L'agent |
| 2. Développer | L'agent |
| 3. Tester en local | L'agent |
| 4. Commit + push | L'agent |
| 5. Ouvrir la Pull Request | L'agent |
| 6. **Le pipeline valide** | La CI, automatiquement |
| 7. **Relire le diff** | **Vous** |
| 8. Merger | **Vous** |

**Les étapes 7 et 8 restent humaines.** C'est le message central de votre diapo 8, et c'est ce
qui rassure une salle : l'agent produit, la CI vérifie, l'humain décide.

---

## Préparation (une seule fois)

### Installer `gh`, le client GitHub en ligne de commande

Il permet à l'agent de créer la Pull Request depuis le terminal, sans passer par le navigateur.
Beaucoup plus fluide en démo.

- **Windows** : `winget install GitHub.cli`
- **macOS** : `brew install gh`
- **Linux/Debian/Ubuntu** : voir <https://cli.github.com>

Puis, une fois :

```
gh auth login
```

Répondez : `GitHub.com` → `HTTPS` → `Y` (authentifier Git) → `Login with a web browser`.
Copiez le code affiché, collez-le dans le navigateur qui s'ouvre.

Vérifiez :

```
gh auth status
```

### Protéger la branche `main` — l'étape qui fait l'effet

C'est **le meilleur moment de la démo** et beaucoup de gens l'oublient : configurez GitHub pour
qu'**une PR ne puisse pas être mergée tant que le pipeline est rouge**. Devant l'audience, le
bouton « Merge » est alors grisé, puis se débloque tout seul quand la CI passe au vert.

1. Sur votre dépôt GitHub → onglet **Settings**
2. Menu de gauche → **Branches**
3. **Add branch ruleset** (ou *Add rule* selon la version de l'interface)
4. Nom : `protection-main`, cible : la branche `main`
5. Cochez :
   - **Require a pull request before merging** — interdit de pousser directement sur `main`
   - **Require status checks to pass** → cherchez et sélectionnez le job **tests**
6. Enregistrez

> Faites ce réglage **après** votre premier push, sinon le job `tests` n'apparaît pas encore
> dans la liste des status checks.

---

## Le déroulé, étape par étape

### Étape 1 — Créer la branche

Dans Claude Code :

> Crée une branche `fix/filtre-gravite` à partir de `main`.

**Ce que vous dites :** « Convention classique : `fix/` pour une correction, `feat/` pour une
fonctionnalité. L'agent respecte les conventions qu'on lui donne. »

### Étape 2 et 3 — Développer et tester

> Le pipeline est rouge et le support a ouvert le ticket INC-2043 : « le filtre par gravité ne renvoie rien ».
> Corrige les deux problèmes, ajoute un test de non-régression pour le filtre, et lance la suite de tests pour vérifier que tout passe.

C'est ici que se produit **le moment fort** : l'agent lance les tests, en voit échouer, et repart
tout seul les corriger. Marquez une pause et commentez.

### Étape 4 — Relire AVANT de committer

> Montre-moi le diff de ce que tu as changé.

**Ne sautez jamais cette étape devant une audience.** Dites-le à voix haute :
« je relis toujours avant de valider — c'est la règle de la diapo 8 ».

### Étape 5 — Commit et push

> Fais un commit avec un message conventionnel qui référence INC-2043, puis pousse la branche sur GitHub.

Le message ressemblera à `fix(incidents): corrige le filtre par gravité et la pagination (INC-2043)`.

**Ce que vous dites :** « Message conventionnel, référence du ticket : exactement ce que
demanderait notre définition de "done". »

### Étape 6 — Ouvrir la Pull Request

> Ouvre une Pull Request vers `main` avec `gh`. Décris le problème, la cause racine et la correction.

Basculez sur GitHub : la PR est là, avec une description structurée. Le pipeline démarre.

**Le moment à souligner :** le bouton **Merge** est **grisé**, avec la mention
*« Required statuses must pass before merging »*.

> « Regardez : même si l'agent a écrit le code, il ne peut pas le merger. La CI est le juge de paix.
> Aucun agent ne contourne nos règles. »

### Étape 7 — Le pipeline passe au vert

Attendez. La croix rouge devient une coche verte ✅. Le bouton **Merge** se débloque.

Pendant l'attente, revenez à l'application, rechargez, refiltrez sur « Critique » :
**les incidents s'affichent enfin**.

### Étape 8 — Merger (c'est vous)

Cliquez **Merge pull request** → **Confirm merge** → **Delete branch**.

Puis, dans le terminal :

```
git checkout main
git pull
```

**Phrase de conclusion :**

> « Rouge il y a dix minutes, vert maintenant, mergé dans `main`.
> Deux bugs corrigés, un test ajouté, une PR documentée.
> Je n'ai pas écrit une ligne de code — mais j'ai relu chaque ligne, et c'est moi qui ai cliqué sur Merge. »

---

## Variante : une fonctionnalité plutôt qu'une correction

Si vous voulez montrer un cycle `feat/` au lieu d'un `fix/`, ou si vous avez du temps pour un
second tour, voici un enchaînement complet et autonome :

> Crée une branche `feat/statistiques`.

> Ajoute un endpoint `GET /api/stats` qui renvoie le nombre d'incidents par gravité et par statut.
> Ajoute les tests correspondants, et affiche ces compteurs en haut de l'interface web.

> Montre-moi le diff, puis commit, pousse et ouvre la PR.

C'est plus impressionnant qu'une correction pour beaucoup de spectateurs : l'agent touche
la base, l'API, les tests **et** l'IHM en une seule tâche.

---

## Si votre équipe est sur GitLab

Tout est identique, avec un autre vocabulaire :

| GitHub | GitLab |
|---|---|
| Pull Request (PR) | Merge Request (MR) |
| `gh` | `glab` |
| Actions | CI/CD → Pipelines |
| Branch ruleset | Settings → Repository → Protected branches |

Le projet contient déjà `.gitlab-ci.yml`, le pipeline fonctionnera sans modification.
Le prompt devient simplement : *« ouvre une Merge Request vers main avec glab »*.

Pour une audience Orange, GitLab est probablement plus parlant — mais faites la démo sur
l'outil où **vous** êtes le plus à l'aise, et mentionnez juste que c'est transposable.

---

## Remise à zéro après une répétition

```
git checkout main
git reset --hard origin/main
git branch -D fix/filtre-gravite
git push origin --delete fix/filtre-gravite
```

Si vous avez déjà mergé la PR pendant la répétition, il faut aussi annuler le merge sur `main` :

```
git revert -m 1 HEAD
git push
```

Puis vérifiez que vous êtes bien revenu à l'état cassé :

```
npm test
```

→ doit afficher `# pass 5` et `# fail 2`.

> **Le plus simple pour répéter plusieurs fois** : faites votre répétition complète, puis
> **supprimez le dépôt GitHub et recréez-le** à partir de votre dossier local remis à zéro.
> C'est plus rapide que de démêler l'historique.

---

## Ce que ce workflow prouve à votre audience

| Ce qu'ils voient | Ce qu'ils comprennent |
|---|---|
| L'agent crée une branche nommée selon la convention | Il respecte nos processus |
| L'agent lance les tests et se corrige | Il vérifie son propre travail |
| Vous relisez le diff avant le commit | L'humain garde le contrôle |
| Le bouton Merge est bloqué tant que la CI est rouge | Nos garde-fous s'appliquent aussi à l'agent |
| C'est vous qui cliquez sur Merge | La décision finale reste humaine |

C'est le résumé de toute votre présentation, démontré en dix minutes.
