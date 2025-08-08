#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f compose.prod.yml"

if [ ! -f nginx/conf.d/reverse-proxy.https.conf.disabled ]; then
  echo "Archivo HTTPS deshabilitado no encontrado."
  exit 1
fi

cp nginx/conf.d/reverse-proxy.https.conf.disabled nginx/conf.d/reverse-proxy.https.conf

echo "Probando configuración de Nginx..."
$COMPOSE exec proxy nginx -t

echo "Recargando Nginx..."
$COMPOSE exec proxy nginx -s reload

echo "HTTPS habilitado correctamente."
