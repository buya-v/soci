#!/usr/bin/env bash
set -euo pipefail

echo "=== SOCI Server Setup ==="

# Step 1: Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "Docker installed. You may need to log out and back in for group changes."
fi

# Step 2: Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
  echo "Installing Docker Compose plugin..."
  sudo apt-get update
  sudo apt-get install -y docker-compose-plugin
fi

# Step 3: Clone repo if not already present
DEPLOY_DIR="/opt/soci"
if [ ! -d "${DEPLOY_DIR}" ]; then
  echo "Cloning repository to ${DEPLOY_DIR}..."
  sudo mkdir -p "${DEPLOY_DIR}"
  sudo chown "$USER":"$USER" "${DEPLOY_DIR}"
  git clone https://github.com/YOUR_USERNAME/soci.git "${DEPLOY_DIR}"
fi

cd "${DEPLOY_DIR}"

# Step 4: Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo ""
  echo "IMPORTANT: Edit .env with your actual values before continuing:"
  echo "  nano ${DEPLOY_DIR}/.env"
  echo ""
  echo "Re-run this script after editing .env."
  exit 0
fi

# Step 5: Initialize SSL certificates
echo "Setting up SSL certificates..."
bash scripts/init-ssl.sh

# Step 6: Build and start all services
echo "Building and starting services..."
docker compose build
docker compose up -d

echo ""
echo "=== Setup complete! ==="
echo "Services running. Check status with: docker compose ps"
echo "View logs with: docker compose logs -f"
