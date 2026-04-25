<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

# Training Camp Backend

Backend API pour la gestion de programmes d'entraînement multi-sports (CrossFit, running, cyclisme, etc.)  
Développé avec [NestJS](https://nestjs.com/) et [Knex](https://knexjs.org/) pour la gestion des migrations et seeds.

---

## 🚀 Fonctionnalités principales

- Gestion des utilisateurs, sports, exercices, workouts, programmes d'entraînement
- Système de migrations et seeds pour initialiser la base
- Healthcheck API (`/health`, `/info`)
- Prêt pour Docker et déploiement cloud
- Architecture évolutive pour ajouter de nouveaux sports facilement

---

## 📦 Installation

```bash
npm install
```

---

## 🛠️ Démarrage du projet

```bash
# Démarrage en développement
npm run start:dev

# Démarrage en production
npm run start:prod
```

---

## 🗄️ Migrations & Seeds

```bash
# Lancer les migrations
npm run db:migrate

# Annuler la dernière migration
npm run db:rollback

# Lancer les seeds (données de base)
npm run db:seed
```

---

## 🩺 Healthcheck

- `GET /health` : Vérifie l'état du backend
- `GET /info` : Informations sur l'application (nom, version, uptime...)

---

## 🐳 Docker

Un fichier `docker-compose.yml` est disponible à la racine pour lancer la base de données et le backend.

```bash
docker-compose up
```

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests end-to-end
npm run test:e2e

# Couverture des tests
npm run test:cov
```

---

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Knex Documentation](https://knexjs.org)
- [Docker Documentation](https://docs.docker.com)

---

## 🤝 Contribuer

- Forkez le projet
- Créez une branche
- Proposez vos PR !

---

## 📝 Licence

MIT

---

## 👤 Auteur

- Training Camp Team