#!/bin/bash
set -e

DOMAIN="training-camp.duckdns.org"
EMAIL="sylydawie@gmail.com"

echo "=== Setup production Training Camp ==="

# Vérifier .env.production
if [ ! -f .env.production ]; then
  echo "Erreur : .env.production manquant. Copie .env.production.example et remplis les valeurs."
  exit 1
fi

echo "1. Mise à jour DuckDNS..."
source .env.production
curl -s "https://www.duckdns.org/update?domains=training-camp&token=${DUCKDNS_TOKEN}&ip="
echo ""

echo "2. Création des dossiers certbot..."
mkdir -p certbot/conf certbot/www

echo "3. Obtention du certificat SSL (Let's Encrypt)..."
# Démarrer nginx en mode HTTP seulement pour le challenge ACME
docker run --rm -d \
  --name nginx-init \
  -p 80:80 \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  nginx:alpine sh -c "
    echo 'server { listen 80; location /.well-known/acme-challenge/ { root /var/www/certbot; } location / { return 200 ok; } }' > /etc/nginx/conf.d/default.conf
    nginx -g 'daemon off;'
  " || true

sleep 2

docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" \
  --agree-tos \
  --non-interactive

docker stop nginx-init 2>/dev/null || true

echo "4. Build et démarrage des services..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

echo "5. Configuration du cron DuckDNS (mise à jour IP toutes les 5 min)..."
chmod +x scripts/duckdns-update.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/scripts/duckdns-update.sh") | sort -u | crontab -

echo ""
echo "=== Setup terminé ==="
echo "L'application est accessible sur https://$DOMAIN"
echo ""
echo "À faire manuellement :"
echo "  1. Configurer le port forwarding sur ton routeur : ports 80 et 443 → IP de ce PC"
echo "  2. Exécuter scripts/wsl2-portforward.ps1 en admin sur Windows (et créer une tâche planifiée au démarrage)"
echo "  3. Mettre à jour Google Cloud Console : ajouter https://$DOMAIN/api/calendar/google/callback comme URI de redirection autorisée"
