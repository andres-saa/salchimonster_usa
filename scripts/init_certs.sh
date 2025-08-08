#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f compose.prod.yml"

echo "Arrancando proxy (HTTP 80) para validación ACME..."
$COMPOSE up -d proxy_tienda_salchimonster_usa

echo "Solicitando certificados para:
usa.salchimonster"

$COMPOSE run --rm certbot certonly --webroot -w /var/www/certbot -d usa.salchimonster \
    --email "andrew19f@gmail.com" --agree-tos --no-eff-email 

echo "Certificados emitidos. Reiniciando proxy..."
$COMPOSE restart proxy_tienda_salchimonster_usa

echo "Ahora habilita HTTPS ejecutando: scripts/enable_https.sh"
