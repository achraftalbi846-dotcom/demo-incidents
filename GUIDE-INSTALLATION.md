# Guide complet — préparer la démo de A à Z

Vous partez de zéro : jamais utilisé Claude Code, pas de base de données en ligne, pas de dépôt GitHub.
Ce guide vous emmène jusqu'à une démo répétée et prête.

**Comptez 1 h 30 la première fois**, en une seule session tranquille. Faites-le **plusieurs jours avant**
la présentation, jamais la veille au soir.

| Partie | Quoi | Durée |
|---|---|---|
| 1 | Installer les outils de base (Node.js, Git) | 15 min |
| 2 | Créer la base de données en ligne | 15 min |
| 3 | Faire tourner le projet sur votre machine | 10 min |
| 4 | Mettre le projet sur GitHub et voir le pipeline rouge | 20 min |
| 5 | Installer Claude Code et apprendre à s'en servir | 20 min |
| 6 | Répéter la démo en entier | 20 min |
| 7 | Remettre à zéro + checklist du jour J | 10 min |

> **Convention** : tout ce qui est dans un cadre `comme ceci` se tape dans un terminal, puis Entrée.
> Le symbole `$` n'est jamais à taper : c'est juste l'invite du terminal.

---

# PARTIE 1 — Installer les outils de base

## 1.1 Ouvrir un terminal

- **Windows** : touche Windows, tapez `PowerShell`, ouvrez **Windows PowerShell**.
- **macOS** : Cmd+Espace, tapez `Terminal`, Entrée.
- **Linux** : Ctrl+Alt+T.

Gardez cette fenêtre ouverte, tout se passe dedans.

## 1.2 Vérifier ce qui est déjà installé

```
node --version
git --version
```

- Si vous voyez `v20.x` ou plus pour Node → c'est bon, passez en 1.4.
- Si vous voyez `command not found` ou une version inférieure à 20 → continuez en 1.3.

## 1.3 Installer Node.js et Git

**Le plus simple, toutes plateformes** : allez sur <https://nodejs.org> et téléchargez la version **LTS**.
Lancez l'installateur, cliquez « Suivant » partout, laissez toutes les options par défaut.

Pour Git : <https://git-scm.com/downloads>. Même chose, tout par défaut.

> Sur Windows, l'installateur Git pose beaucoup de questions. Cliquez « Next » sans rien changer.

**Fermez et rouvrez le terminal**, puis revérifiez :

```
node --version
git --version
```

## 1.4 Dire à Git qui vous êtes

Une seule fois dans votre vie, sur cette machine :

```
git config --global user.name "Achraf"
git config --global user.email "votre.email@exemple.com"
```

Mettez l'adresse e-mail que vous utiliserez pour votre compte GitHub.

---

# PARTIE 2 — Créer la base de données en ligne

Vous avez deux options. **Je recommande la A** : rien à installer, et une vraie base distante
fait son petit effet devant l'audience.

## Option A — Base en ligne gratuite (recommandée)

On utilise **Neon**, un hébergeur PostgreSQL avec une offre gratuite sans carte bancaire.

1. Allez sur <https://neon.com> et cliquez sur **Sign up**.
2. Connectez-vous avec GitHub ou Google (le plus rapide).
3. Neon propose de créer un projet. Nommez-le `demo-incidents`.
   - Région : prenez la plus proche (Europe, par ex. Frankfurt).
   - Version PostgreSQL : laissez par défaut.
4. Cliquez **Create project**.
5. Neon affiche alors une **connection string**. Cherchez le bouton **Connect** ou l'encadré
   *Connection string*, et copiez la ligne qui ressemble à :

```
postgresql://neondb_owner:AbCd1234@ep-cool-mode-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

6. **Collez-la immédiatement dans un fichier texte.** Le mot de passe n'est parfois affiché qu'une fois.

> ⚠️ Cette chaîne contient un mot de passe. Ne la mettez jamais dans Git, ne l'affichez pas
> en plein écran pendant la démo. On la rangera dans un fichier `.env` qui est déjà ignoré par Git.

*Supabase (<https://supabase.com>) ou Railway fonctionnent aussi : cherchez « Connection string »
au format `postgresql://…` dans les réglages du projet.*

## Option B — Base locale avec Docker

Si vous avez déjà Docker Desktop, ou si vous n'avez pas le droit d'utiliser un service externe :

1. Installez Docker Desktop : <https://www.docker.com/products/docker-desktop/>
2. Lancez-le et attendez que l'icône passe au vert.
3. La commande viendra en partie 3, le projet contient déjà le fichier `docker-compose.yml`.

Votre chaîne de connexion sera alors simplement :

```
postgres://demo:demo@localhost:5432/incidents
```

---

# PARTIE 3 — Faire tourner le projet sur votre machine

## 3.1 Décompresser le projet

Décompressez `incidents-demo.zip` dans un dossier facile à retrouver, par exemple :

- Windows : `C:\Users\VotreNom\projets\incidents-demo`
- macOS/Linux : `~/projets/incidents-demo`

## 3.2 Aller dans le dossier depuis le terminal

```
cd ~/projets/incidents-demo
```

Sur Windows :

```
cd C:\Users\VotreNom\projets\incidents-demo
```

Vérifiez que vous êtes au bon endroit — vous devez voir `package.json` :

```
ls
```

*(sur Windows PowerShell, `ls` fonctionne aussi)*

## 3.3 Installer les dépendances

```
npm install
```

Une minute environ. Un dossier `node_modules` apparaît, c'est normal.

## 3.4 Renseigner la base de données

Créez le fichier de configuration :

```
cp .env.example .env
```

Sur Windows PowerShell :

```
copy .env.example .env
```

Ouvrez `.env` dans un éditeur de texte (Bloc-notes, VS Code, peu importe) et remplacez la ligne
`DATABASE_URL=` par **votre** chaîne de connexion Neon :

```
DATABASE_URL=postgresql://neondb_owner:AbCd1234@ep-cool-mode-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
PORT=3000
```

Si vous avez choisi Docker (option B), lancez d'abord la base :

```
docker compose up -d
```

et laissez la ligne `DATABASE_URL=postgres://demo:demo@localhost:5432/incidents`.

## 3.5 Créer les tables et les données

```
npm run seed
```

Vous devez voir :

```
✔ migration appliquée
✔ 24 incidents insérés
```

> **Si ça échoue** : c'est presque toujours la chaîne de connexion. Vérifiez qu'elle est sur
> une seule ligne, sans espace, sans guillemets, et qu'elle se termine bien par `?sslmode=require`
> pour Neon.

## 3.6 Lancer l'application

```
npm start
```

Ouvrez <http://localhost:3000> dans votre navigateur. Vous voyez la liste des incidents.

**Vérifiez les deux bugs — c'est important, ce sont eux la démo :**

1. Dans le menu « Gravité », choisissez **Critique**, cliquez **Filtrer**.
   → Le tableau est **vide**. C'est le bug n°1. ✔
2. Cliquez **Réinitialiser**. Regardez les numéros dans la première colonne :
   ils ne commencent **pas** à 1. C'est le bug n°2. ✔

Laissez le serveur tourner. Pour l'arrêter plus tard : **Ctrl+C** dans le terminal.

## 3.7 Vérifier que les tests sont bien rouges

Ouvrez un **second** terminal (le premier fait tourner le serveur), placez-vous dans le même dossier :

```
cd ~/projets/incidents-demo
npm test
```

En bas, vous devez lire :

```
# pass 5
# fail 2
```

**Deux tests échouent : c'est exactement l'état de départ voulu.** Ne les corrigez pas.

---

# PARTIE 4 — Mettre le projet sur GitHub

## 4.1 Créer un compte et un dépôt

1. <https://github.com> → **Sign up** si vous n'avez pas de compte.
2. Une fois connecté, cliquez le **+** en haut à droite → **New repository**.
3. Remplissez :
   - **Repository name** : `demo-incidents`
   - **Public** ou **Private** : les deux marchent (Actions est gratuit sur les dépôts publics,
     et inclus avec un quota généreux sur les privés).
   - **N'ajoutez ni README, ni .gitignore, ni licence.** Laissez toutes les cases décochées.
4. **Create repository**.

GitHub affiche alors une page avec des commandes. Gardez-la ouverte.

## 4.2 Envoyer le projet

Dans votre terminal, dans le dossier du projet :

```
git init
git add .
git commit -m "chore: application de supervision des incidents"
git branch -M main
```

Puis la commande qui relie votre dossier au dépôt GitHub — **remplacez `VOTRE-COMPTE`** :

```
git remote add origin https://github.com/VOTRE-COMPTE/demo-incidents.git
git push -u origin main
```

**Au premier `push`, GitHub demande de vous authentifier.** Une fenêtre de navigateur s'ouvre :
connectez-vous et autorisez. Si aucune fenêtre ne s'ouvre et qu'on vous demande un mot de passe
dans le terminal, le mot de passe de votre compte **ne marchera pas** — il faut un jeton :

1. GitHub → votre photo en haut à droite → **Settings**
2. Tout en bas à gauche → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. Cochez la case **repo**, validez, **copiez le jeton**
5. Collez-le à la place du mot de passe dans le terminal

> Vérifiez que le fichier `.env` **n'est pas** parti sur GitHub : il contient votre mot de passe
> de base de données. Il est listé dans `.gitignore`, donc il doit être absent.
> Sur la page du dépôt, vous devez voir `.env.example` mais **pas** `.env`.

## 4.3 Voir le pipeline devenir rouge

Le projet contient déjà `.github/workflows/ci.yml`. GitHub le détecte tout seul.

1. Sur la page de votre dépôt, cliquez l'onglet **Actions**.
2. Vous voyez un job **CI** en cours (point orange).
3. Attendez une minute. Il passe en **croix rouge** ❌.
4. Cliquez dessus → **tests** → déroulez l'étape `npm test` : vous voyez les 2 tests en échec.

**C'est votre point de départ visuel.** Gardez cet onglet ouvert le jour J.

> **Bonne nouvelle** : aucun secret à configurer. Le pipeline crée sa propre base PostgreSQL jetable.
> Votre base Neon sert uniquement à l'application sur votre machine.

---

# PARTIE 5 — Installer Claude Code et apprendre à s'en servir

## 5.1 Ce qu'il vous faut

Un compte Claude avec un abonnement (Pro ou Max), ou une clé API Anthropic.
Si Orange a un accès entreprise, demandez à votre équipe — c'est la voie à privilégier
pour un usage professionnel.

Prérequis machine : macOS 13+, Windows 10 (1809+) ou Ubuntu 20.04+/Debian 10+, et 4 Go de RAM.

## 5.2 Installer

**macOS / Linux / WSL :**

```
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell :**

```
irm https://claude.ai/install.ps1 | iex
```

*Avec Homebrew sur macOS : `brew install --cask claude-code`.*

**Fermez et rouvrez le terminal**, puis vérifiez :

```
claude --version
```

> Si vous préférez une interface graphique à un terminal, il existe aussi une **application de bureau**
> Claude Code et une **extension VS Code**. Le déroulé de la démo est identique — mais pour une
> démonstration devant une salle, le terminal est plus lisible au vidéoprojecteur.

## 5.3 Premier lancement

Placez-vous dans le dossier du projet, puis lancez :

```
cd ~/projets/incidents-demo
claude
```

**Au premier lancement**, Claude Code vous demande de vous connecter : un navigateur s'ouvre,
vous vous authentifiez, vous revenez au terminal. C'est fait une fois pour toutes.

Vous voyez alors une invite qui attend votre message. **Vous tapez en français, en langage normal.**

## 5.4 Prenez 10 minutes pour vous familiariser

**Ne sautez pas cette étape.** Le jour J, vous devez être à l'aise avec l'outil, pas le découvrir.

Essayez ces trois messages, l'un après l'autre :

```
Explique-moi en 5 lignes ce que fait ce projet.
```

```
Combien y a-t-il de tests dans ce projet, et que vérifient-ils ?
```

```
Lance les tests et dis-moi ce qui échoue.
```

Observez : Claude Code **demande votre autorisation** avant de lancer une commande ou de modifier
un fichier. Vous répondez avec les flèches et Entrée. C'est normal, et c'est même rassurant à
montrer devant une audience — ça illustre votre diapo 8.

## 5.5 Les touches à connaître

| Touche | Effet |
|---|---|
| **Entrée** | Envoyer le message |
| **Échap** | Interrompre Claude en cours de route (le travail déjà fait est conservé) |
| **Ctrl+C** | Interrompre ; si rien ne tourne, vide la saisie, puis quitte |
| **Ctrl+D** | Quitter la session |
| **Maj+Tab** | Changer de mode d'autorisation |
| **↑** | Rappeler le message précédent |

Quelques commandes utiles, à taper dans l'invite :

| Commande | Effet |
|---|---|
| `/help` | La liste complète des commandes de **votre** version |
| `/clear` | Repartir d'une conversation vide |
| `/model` | Changer de modèle |

> **Le mode d'autorisation.** Par défaut Claude Code demande confirmation à chaque action.
> Pour une démo fluide, `Maj+Tab` permet de passer en mode où les modifications de fichiers
> sont acceptées automatiquement. **Ne le faites que sur ce projet de démo**, jamais sur du
> vrai code Orange — et dites-le à voix haute devant la salle, ça montre que vous maîtrisez le sujet.

---

# PARTIE 6 — Répéter la démo en entier

**Faites cette répétition en entier, au moins une fois.** Le déroulé ne sera jamais identique
d'une fois sur l'autre — c'est le propre d'un agent. L'objectif n'est pas d'apprendre un script,
mais de savoir quoi dire pendant les temps morts.

**Enregistrez cette répétition** (capture vidéo de l'écran). Ce sera votre filet si le réseau
lâche le jour J.

Le déroulé détaillé, avec les prompts exacts et ce que vous dites à chaque étape, est dans
**`DEMO.md`**. En résumé :

| Acte | Ce que vous demandez | Durée |
|---|---|---|
| 1 | « Explique-moi ce projet, et pourquoi le filtre par gravité ne renvoie rien » | 2 min |
| 2 | « Corrige les deux problèmes, ajoute un test, lance la suite » | 5 min |
| 3 | « Crée une branche, commit, pousse » | 3 min |

**Le moment fort, c'est l'acte 2** : quand Claude Code lance les tests, en voit échouer, et repart
tout seul les corriger. Marquez une pause à ce moment-là et commentez :
*« personne ne lui a dit que c'était cassé — il l'a vu tout seul. »*

Après le push, retournez sur l'onglet **Actions** de GitHub : le pipeline passe au **vert**.

---

# PARTIE 7 — Remettre à zéro, et checklist du jour J

## 7.1 Remettre le projet dans l'état de départ

Après chaque répétition :

```
git checkout main
git reset --hard origin/main
git branch -D fix/filtre-gravite
git push origin --delete fix/filtre-gravite
```

Vérifiez ensuite que vous êtes bien revenu à l'état cassé :

```
npm test
```

→ doit afficher `# pass 5` et `# fail 2`. Si oui, vous êtes prêt à rejouer.

> `main` doit **toujours rester rouge**. C'est votre point de départ.

## 7.2 Checklist du jour J

Une heure avant :

- [ ] `npm start` lancé, <http://localhost:3000> s'affiche
- [ ] Le filtre « Critique » renvoie bien une liste vide
- [ ] `npm test` affiche 5 réussis / 2 échoués
- [ ] L'onglet **Actions** de GitHub est ouvert, dernier pipeline en rouge
- [ ] `claude` démarre sans redemander de connexion
- [ ] La vidéo de secours est accessible
- [ ] Le terminal est en **grande police** (Ctrl+= ou Cmd+= plusieurs fois) et en thème clair
- [ ] Les notifications système sont coupées
- [ ] `DEMO.md` est ouvert sur un second écran

Onglets à préparer, dans cet ordre :

1. L'application — <http://localhost:3000>
2. GitHub → onglet Actions
3. Le terminal avec `claude` lancé

## 7.3 Si quelque chose se passe mal en direct

| Problème | Quoi faire |
|---|---|
| Claude part dans une mauvaise direction | **Échap**, puis recadrez. C'est honnête, et ça illustre la bonne pratique n°4 « itérer » |
| Le réseau tombe | Basculez sur la vidéo de secours, commentez-la — l'explication a autant de valeur |
| La base Neon ne répond pas | `docker compose up -d`, changez `DATABASE_URL` dans `.env`, `npm run seed`, `npm start` |
| Le pipeline traîne | Commentez le diff pendant l'attente — c'est justement le message de la diapo 8 |
| Vous êtes en retard sur le temps | Sautez l'acte 1, allez directement à l'acte 2 |

---

# Aide-mémoire des commandes

```
npm install          # une fois, installe les dépendances
npm run seed         # crée les tables et les données de démo
npm start            # lance l'application sur localhost:3000
npm test             # lance les tests
claude               # démarre Claude Code dans le dossier courant
git push             # envoie les commits sur GitHub
docker compose up -d # démarre la base locale (option B seulement)
```

---

# En cas de blocage

| Message d'erreur | Cause probable | Solution |
|---|---|---|
| `command not found: node` | Node.js pas installé ou terminal pas relancé | Fermez et rouvrez le terminal |
| `ECONNREFUSED` au `npm run seed` | La base n'est pas joignable | Vérifiez `DATABASE_URL` dans `.env` |
| `password authentication failed` | Mauvais mot de passe dans la chaîne | Recopiez la chaîne depuis Neon |
| `EADDRINUSE :::3000` | Un serveur tourne déjà | Ctrl+C dans l'autre terminal, ou changez `PORT` dans `.env` |
| `npm test` : 7 réussis | Les bugs ont été corrigés | `git checkout src/repository.js` |
| `Permission denied (publickey)` au push | Authentification GitHub | Utilisez l'URL `https://…` et un jeton (voir 4.2) |

Si un point reste bloqué, notez le message d'erreur **exact** — c'est ce qui permet de vous
débloquer en une minute.
