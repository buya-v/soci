#!/usr/bin/env bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "${DOMAIN:-}" ]; then
  echo "Error: DOMAIN is not set in .env"
  exit 1
fi

if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "Error: CERTBOT_EMAIL is not set in .env"
  exit 1
fi

echo "=== Starting SSL certificate setup for ${DOMAIN} ==="

# Step 1: Use HTTP-only nginx config for initial cert issuance
echo "Swapping to initial (HTTP-only) nginx config..."
cp nginx/nginx.initial.conf nginx/nginx.active.conf

# Replace domain placeholder
sed -i "s/\${DOMAIN}/${DOMAIN}/g" nginx/nginx.active.conf

# Use the active config in docker-compose
docker compose up -d nginx

echo "Waiting for nginx to start..."
sleep 5

# Step 2: Request certificate from Let's Encrypt
echo "Requesting SSL certificate..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "${CERTBOT_EMAIL}" \
  --agree-tos \
  --no-eff-email \
  -d "${DOMAIN}"

# Step 3: Switch to full SSL nginx config
echo "Switching to SSL nginx config..."
cp nginx/nginx.conf nginx/nginx.active.conf
sed -i "s/\${DOMAIN}/${DOMAIN}/g" nginx/nginx.active.conf

# Step 4: Reload nginx with SSL config
echo "Reloading nginx..."
docker compose exec nginx nginx -s reload

# Step 5: Set up auto-renewal cron job
echo "Setting up certificate auto-renewal..."
CRON_JOB="0 3 * * * cd $(pwd) && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "${CRON_JOB}") | crontab -

echo "=== SSL setup complete! ==="
echo "Certificate will auto-renew daily at 3am."
