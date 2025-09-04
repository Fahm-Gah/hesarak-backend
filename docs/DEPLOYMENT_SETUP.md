# Auto-Deployment Setup Guide

## GitHub Actions Configuration

### 1. Generate SSH Key for Deployment (on your local machine)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key
```

### 2. Add Public Key to Droplet

SSH into your droplet and add the public key:

```bash
# On your droplet
cat >> ~/.ssh/authorized_keys
# Paste the content of github_deploy_key.pub
```

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

- **DROPLET_HOST**: Your droplet's IP address (e.g., `164.92.123.45`)
- **DROPLET_USERNAME**: SSH username (usually `root` or your custom user)
- **DROPLET_SSH_KEY**: The **private** key content (entire content of `github_deploy_key`)
- **DROPLET_PORT**: SSH port (default `22`, or custom if changed)

### 4. Setup on Droplet

#### Install PM2 (if not already installed)

```bash
npm install -g pm2
pm2 startup systemd
```

#### Clone Repository (first time)

```bash
cd /var/www  # or your preferred directory
git clone https://github.com/YOUR_USERNAME/hesarak-backend.git
cd hesarak-backend
```

#### Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

#### Environment Variables

Create `.env` file with your production configuration:

```bash
cp .env.example .env
nano .env
# Add your production environment variables
```

#### Initial Setup

```bash
# Generate types
pnpm generate:types

# Build the application
pnpm build

# Start with PM2
pm2 start pnpm --name "hesarak-backend" -- start
pm2 save
```

#### Make Deploy Script Executable

```bash
chmod +x /var/www/hesarak-backend/scripts/deploy.sh
```

### 5. Nginx Configuration (if using as reverse proxy)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## How It Works

1. Push code to `main` branch on GitHub
2. GitHub Actions workflow triggers automatically
3. Workflow SSHs into your droplet
4. Pulls latest code, installs dependencies, builds, and restarts the app
5. Application is live with new changes!

## Alternative: Webhook-Based Deployment

If you prefer webhook-based deployment, you can use the webhook handler script:

1. Set up the webhook endpoint on your server
2. Configure GitHub webhook to call your endpoint on push
3. The endpoint triggers the deployment script

## Monitoring

Check deployment status:

```bash
# View PM2 processes
pm2 list

# View logs
pm2 logs hesarak-backend

# Monitor resources
pm2 monit
```

## Troubleshooting

### Permission Issues

```bash
# Ensure git directory has correct permissions
sudo chown -R $USER:$USER /var/www/hesarak-backend

# Ensure node_modules can be written
chmod -R 755 /var/www/hesarak-backend
```

### PM2 Not Starting

```bash
# Check PM2 logs
pm2 logs hesarak-backend --lines 100

# Restart PM2
pm2 restart hesarak-backend

# If needed, delete and recreate
pm2 delete hesarak-backend
pm2 start pnpm --name "hesarak-backend" -- start
```

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next
pnpm install --force
pnpm build
```
