#!/usr/bin/env bash
# Generate self-signed SSL certificate for development/testing
set -euo pipefail

CERT_DIR="${1:-./certs}"
DOMAIN="${2:-localhost}"
DAYS="${3:-365}"

mkdir -p "$CERT_DIR"

echo "Generating self-signed SSL certificate for '$DOMAIN' ..."

openssl req -x509 -nodes -days "$DAYS" \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/CN=$DOMAIN/O=EA Dashboard/C=CH" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:*.${DOMAIN},IP:127.0.0.1"

echo "Certificate generated:"
echo "  $CERT_DIR/server.crt"
echo "  $CERT_DIR/server.key"
