# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Monorepo regroupant deux applications indépendantes partageant une infrastructure Docker commune.

## Structure

```
apps/
  training-camp/        # Cross-training app (Next.js + NestJS + PostgreSQL/Knex)
  family-hub/           # Hub familial (Next.js + NestJS + Supabase + Redis)
                        # Inclut la génération de recettes IA (ex-recipe-ai, intégré)
docker-compose.yml      # Infrastructure partagée (PostgreSQL, Redis, pgAdmin)
.env.example            # Toutes les variables d'environnement du monorepo
```

Chaque app a son propre `CLAUDE.md` avec ses conventions, architecture, et commandes détaillées. Lire le CLAUDE.md de l'app concernée avant de travailler dessus.

## Infrastructure partagée

### Démarrer les services
```bash
docker compose up -d          # PostgreSQL + Redis
docker compose --profile tools up -d   # + pgAdmin sur http://localhost:5050
docker compose down
```

### Bases de données
Un seul container PostgreSQL (port **5432**) avec deux bases isolées :
- `training_camp` — utilisée par training-camp (Knex.js)
- `ai_agent_platform` — utilisée par family-hub (TypeORM)

Le script `scripts/init-databases.sh` crée automatiquement les deux bases au premier démarrage du container.

### Redis
Port **6379**, utilisé uniquement par family-hub backend.

## Commandes racine

```bash
# Lancer une app spécifique
npm run dev:training-camp
npm run dev:family-hub

# Lancer toutes les apps simultanément
npm run dev

# Build
npm run build:training-camp
npm run build:family-hub
```

## Ports

| App | Service | Port |
|-----|---------|------|
| training-camp | Frontend (Next.js) | 3000 |
| training-camp | Backend (NestJS) | 3001 |
| family-hub | Web (Next.js) | 3002 |
| family-hub | Backend (NestJS) | 3003 |
| PostgreSQL | — | 5432 |
| Redis | — | 6379 |
| pgAdmin | — | 5050 |

## Variables d'environnement

Copier `.env.example` en `.env` et remplir les valeurs. Les variables sont préfixées par app :
- `TC_*` — training-camp
- `FH_*` — family-hub

Chaque app charge aussi son propre `.env` / `.env.local` dans son répertoire.

## Subtree git

Les apps ont été intégrées via `git subtree add --squash`. Pour synchroniser avec leur repo d'origine :

```bash
git subtree pull --prefix=apps/training-camp https://github.com/Dawie33/training-camp.git main --squash
git subtree pull --prefix=apps/family-hub https://github.com/Dawie33/family-hub.git main --squash
```

## Stack commune

Les deux apps partagent : TypeScript, npm, Next.js 16, React 19. Les backends (training-camp, family-hub) utilisent NestJS 11. Gestionnaire de packages : **npm** uniquement — ne pas mélanger avec yarn ou pnpm.
