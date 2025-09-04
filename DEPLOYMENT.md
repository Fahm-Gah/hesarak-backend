# Production Deployment Guide

## Overview

This guide covers deploying the Hesarak bus booking system to a DigitalOcean VPS with automated GitHub deployments.

## Prerequisites

- DigitalOcean droplet (minimum 1GB RAM, Ubuntu 22.04)
- Domain name pointing to your droplet IP
- GitHub repository with your code
- MongoDB Atlas account (free tier)
- UploadThing account for file storage

## Initial Server Setup

### 1. Connect to Your VPS

```bash
ssh root@your_server_ip
```

### 2. System Updates & Dependencies

```bash
# Update packages
apt update && apt upgrade -y

# Install essentials
apt install -y curl wget git nginx ufw

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install pnpm & PM2
npm install -g pnpm pm2
```

### 3. Configure Firewall

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
```

## Application Setup

### 1. Clone Repository

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/YOUR_USERNAME/hesarak-backend.git
cd hesarak-backend
```

### 2. Environment Configuration

```bash
cp .env.example .env
nano .env
```

Required environment variables:

```env
# MongoDB Atlas
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/hesarak

# PayloadCMS
PAYLOAD_SECRET=your-64-character-random-string
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token

# Production
NODE_ENV=production
```

### 3. Initial Build & Start

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate types
pnpm generate:types

# Build application
NODE_OPTIONS="--max-old-space-size=768" pnpm build

# Start with PM2
pm2 start pnpm --name "hesarak-backend" -- start
pm2 save
pm2 startup systemd -u root --hp /root
```

## Nginx Configuration

### 1. Create Site Configuration

```bash
nano /etc/nginx/sites-available/hesarak
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

### 2. Enable Site

```bash
ln -s /etc/nginx/sites-available/hesarak /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 3. SSL Setup (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Automated GitHub Deployments

### 1. Generate SSH Key for GitHub Actions

On your **local machine**:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
```

### 2. Add Public Key to VPS

```bash
# Copy public key content
cat ~/.ssh/github_deploy.pub

# On VPS, add to authorized_keys
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
```

### 3. Configure GitHub Secrets

Go to GitHub repo → Settings → Secrets → Actions, add:

- `DROPLET_HOST`: Your server IP
- `DROPLET_USERNAME`: root
- `DROPLET_PORT`: 22
- `DROPLET_SSH_KEY`: Private key content (entire file including BEGIN/END)

### 4. GitHub Actions Workflow

Already configured in `.github/workflows/deploy.yml`. Pushes to `main` branch trigger automatic deployment.

## MongoDB Atlas Setup

### 1. Create Free Cluster

1. Sign up at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create M0 Sandbox cluster (free tier)
3. Choose region closest to your VPS

### 2. Configure Access

1. **Database Access**: Create user with read/write permissions
2. **Network Access**: Add your VPS IP address
3. **Connection String**: Copy from Connect → Connect your application

## Monitoring & Maintenance

### View Application Status

```bash
pm2 status              # Process status
pm2 logs hesarak-backend # Application logs
pm2 monit               # Real-time monitoring
```

### Manual Update

```bash
cd /var/www/hesarak-backend
git pull origin main
pnpm install --frozen-lockfile
pnpm generate:types
pnpm build
pm2 restart hesarak-backend
```

### Check Deployment Logs

```bash
# PM2 logs
pm2 logs hesarak-backend --lines 50

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs hesarak-backend

# Test in development mode
cd /var/www/hesarak-backend
pnpm dev
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install --force
NODE_OPTIONS="--max-old-space-size=768" pnpm build
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# Kill if needed
kill -9 <PID>
```

### Low Memory Issues

For 1GB VPS, optimize build:

```bash
# Add swap file
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Security Best Practices

1. **Keep secrets secure**: Never commit `.env` files
2. **Regular updates**: `apt update && apt upgrade`
3. **Use SSH keys**: Disable password authentication
4. **Configure firewall**: Only open necessary ports
5. **Enable HTTPS**: Always use SSL in production
6. **Monitor logs**: Check for suspicious activity

## Performance Optimization

1. **Enable pnpm cache**:

   ```bash
   pnpm config set store-dir ~/.pnpm-store
   ```

2. **PM2 cluster mode** (for multi-core VPS):

   ```bash
   pm2 start ecosystem.config.cjs
   ```

3. **Nginx caching**: Already configured for static files

## Quick Commands Reference

```bash
# Application control
pm2 restart hesarak-backend  # Restart app
pm2 stop hesarak-backend     # Stop app
pm2 start hesarak-backend    # Start app

# Monitoring
pm2 status                   # Check status
pm2 logs                     # View all logs
htop                         # System resources

# Deployment
git pull && pnpm install && pnpm build && pm2 restart hesarak-backend
```

---

Your application is now deployed with automatic GitHub deployments. Push to `main` branch to trigger deployments!
