#!/bin/bash
set -e

DUMP_FILE="/tmp/supabase-dump.sql"

echo "=== Migration Supabase → local ==="

# Vérifier que pg_dump est disponible
if ! command -v pg_dump &> /dev/null; then
  echo "Installation de postgresql-client..."
  sudo apt-get update -qq && sudo apt-get install -y postgresql-client
fi

echo "Mot de passe Supabase :"
read -s SUPABASE_PASSWORD

echo "1. Export des données depuis Supabase..."
PGPASSWORD="$SUPABASE_PASSWORD" pg_dump \
  -h aws-1-us-east-2.pooler.supabase.com \
  -p 5432 \
  -U postgres.dvgibdnbsarpjhahkpeb \
  -d postgres \
  -n public \
  --data-only \
  --no-owner \
  --no-acl \
  --disable-triggers \
  -f "$DUMP_FILE"

echo "   Export OK : $DUMP_FILE"

echo "2. Démarrage du postgres de production..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres
echo "   Attente que postgres soit prêt..."
sleep 8

echo "3. Création de la base si besoin..."
source .env.production
docker exec training-camp-prod-db psql -U "$DATABASE_USER" -tc \
  "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'" | grep -q 1 || \
  docker exec training-camp-prod-db psql -U "$DATABASE_USER" -c \
  "CREATE DATABASE $DATABASE_NAME"

echo "4. Import des données..."
docker exec -i training-camp-prod-db psql \
  -U "$DATABASE_USER" \
  -d "$DATABASE_NAME" < "$DUMP_FILE"

echo ""
echo "=== Migration terminée ==="
rm -f "$DUMP_FILE"
