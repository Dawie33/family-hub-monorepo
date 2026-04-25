# 🏋️‍♂️ Training Camp

**Training Camp** est une plateforme multi-sports (cross-training, running, cyclisme, etc.) qui utilise l’intelligence artificielle pour générer des séances d’entraînement personnalisées.  
Chaque programme s’adapte à ton profil, ton matériel disponible, tes objectifs et ton niveau de fatigue.

---

## 🚀 Fonctionnalités principales

- Génération de **WOD et séances personnalisées** via IA (force, cardio, skills, running, vélo…)
- Prise en compte du **profil utilisateur** (niveau, objectifs, blessures, matériel)
- **Historique d’entraînements** et suivi des performances
- **Substitutions automatiques** si un exercice ou un matériel n’est pas disponible
- Interface moderne avec **Next.js + TailwindCSS**
- Backend modulaire avec **NestJS + PostgreSQL (Knex)**
- Système de migrations et seeds pour initialiser la base
- Healthcheck API (`/health`, `/info`)
- Prêt pour Docker et déploiement cloud
- Architecture évolutive pour ajouter de nouveaux sports facilement

---

## 🛠️ Stack technique

- **Frontend** : Next.js (React), TailwindCSS
- **Backend** : NestJS, Knex.js, PostgreSQL
- **IA** : Génération guidée par LLM + règles métier
- **Tests** : Vitest (frontend), Jest (backend)
- **DevOps** : Docker, docker-compose

---

## 📦 Installation & Démarrage

```bash
# Cloner le projet
git clone https://github.com/<ton-pseudo>/training-camp.git
cd training-camp

# Installer les dépendances globales
npm install

# Lancer le frontend
cd frontend && npm run dev

# Lancer le backend
cd backend && npm run start:dev
```

---

## 🗄️ Migrations & Seeds (Backend)

```bash
# Lancer les migrations
npm run db:migrate

# Annuler la dernière migration
npm run db:rollback

# Lancer les seeds (données de base)
npm run db:seed
```

---

## 🩺 Healthcheck (Backend)

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
# Tests frontend
cd frontend && npm run test

# Tests backend
cd backend && npm run test

# Couverture des tests backend
cd backend && npm run test:cov
```

---

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [Knex Documentation](https://knexjs.org)
- [Next.js Documentation](https://nextjs.org)
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