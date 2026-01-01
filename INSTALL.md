# SOCI Installation Guide - Ubuntu Server

This guide covers deploying SOCI on Ubuntu Server 22.04/24.04 LTS.

## Prerequisites

- Ubuntu Server 22.04 or 24.04 LTS
- Root or sudo access
- Domain name (optional, for SSL)
- Minimum 1GB RAM, 1 CPU core
- API keys: Anthropic (required), OpenAI (optional for images)

## Quick Start

```bash
# Clone and deploy in one command
git clone https://github.com/buya-v/soci.git && cd soci && ./deploy.sh
```

---

## Manual Installation

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20.x

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 4: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/soci
sudo chown $USER:$USER /var/www/soci

# Clone repository
git clone https://github.com/buya-v/soci.git /var/www/soci
cd /var/www/soci
```

### Step 5: Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Step 6: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/soci
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP
    root /var/www/soci/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/soci /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 7: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## SSL Setup (Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo systemctl status certbot.timer
```

---

## Configuration

### API Keys

SOCI stores API keys in browser localStorage. Users configure them in:
**Automation Hub > API Configuration**

Required:
- **Anthropic API Key**: For AI content generation
- **OpenAI API Key**: For AI image generation (optional)

### Environment Variables (Optional)

For server-side configuration, create `/var/www/soci/.env`:

```bash
# Optional: Pre-configure default settings
VITE_APP_NAME=SOCI
VITE_DEFAULT_THEME=dark
```

---

## Maintenance

### Update Application

```bash
cd /var/www/soci
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

### View Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Backup Data

User data is stored in browser localStorage. For backup:
1. Go to Dashboard > Export
2. Export all data as JSON

---

## Docker Deployment (Alternative)

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf for Docker

Create `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build & Run

```bash
# Build image
docker build -t soci:latest .

# Run container
docker run -d -p 80:80 --name soci soci:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  soci:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

---

## Troubleshooting

### Common Issues

**1. 502 Bad Gateway**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**2. Permission Denied**
```bash
sudo chown -R www-data:www-data /var/www/soci/dist
```

**3. Build Fails**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install
npm run build
```

**4. SSL Certificate Issues**
```bash
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

### Health Check

```bash
# Check Nginx status
sudo systemctl status nginx

# Check if site is accessible
curl -I http://localhost

# Check disk space
df -h

# Check memory
free -m
```

---

## Security Recommendations

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure fail2ban**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

3. **Regular backups**
   - Export user data regularly via Dashboard
   - Backup `/var/www/soci` directory

4. **Monitor logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

---

## System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Storage | 1 GB | 5+ GB |
| OS | Ubuntu 22.04 | Ubuntu 24.04 |
| Node.js | 18.x | 20.x |

---

## Support

- GitHub Issues: https://github.com/buya-v/soci/issues
- Documentation: https://github.com/buya-v/soci#readme

---

## Version

SOCI MVP v2.0.0
