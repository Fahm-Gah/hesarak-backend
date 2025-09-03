# DigitalOcean VPS Deployment Manual for حصارک پنجشیر

This guide will help you deploy your PayloadCMS + Next.js bus booking application on a DigitalOcean VPS using MongoDB Atlas (free tier) and UploadThing for file storage.

## Prerequisites

- DigitalOcean droplet (minimum 1GB RAM, 10GB storage recommended)
- Domain name (optional but recommended)
- SSH access to your droplet
- MongoDB Atlas account (free tier)
- UploadThing account

## Step 1: Set Up MongoDB Atlas (Free Tier)

### Create MongoDB Atlas Account:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new project called "hesarak"

### Create a Free Cluster:

1. Click "Create a cluster"
2. Choose "M0 Sandbox" (Free tier - 512MB storage)
3. Select a region close to your VPS location
4. Name your cluster "hesarak-cluster"

### Configure Database Access:

1. Go to "Database Access" in left menu
2. Click "Add New Database User"
3. Create a user (e.g., `hesarak_user`) with a strong password
4. Give it "Read and write to any database" role

### Configure Network Access:

1. Go to "Network Access" in left menu
2. Click "Add IP Address"
3. Add your VPS IP address, or use `0.0.0.0/0` for testing (less secure)

### Get Connection String:

1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

## Step 2: Set Up UploadThing Account

### Create UploadThing Account:

1. Go to https://uploadthing.com/
2. Sign up with GitHub or email
3. Create a new project

### Get API Keys:

1. In your UploadThing dashboard, go to API Keys
2. Copy your App ID and API Key
3. You'll need these for your environment variables

## Step 3: Initial Server Setup

### Connect to your droplet:

```bash
ssh root@your_droplet_ip
```

### Update system packages:

```bash
apt update && apt upgrade -y
```

### Install essential packages:

```bash
apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release ufw git
```

## Step 4: Install Node.js and PNPM

### Install Node.js 18.x:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
```

### Install PNPM globally:

```bash
npm install -g pnpm
```

### Install PM2 process manager:

```bash
npm install -g pm2
```

### Verify installations:

```bash
node --version    # Should be v18.x
npm --version
pnpm --version
pm2 --version
```

## Step 5: Install and Configure Nginx

### Install Nginx:

```bash
apt install -y nginx
```

### Start and enable Nginx:

```bash
systemctl start nginx
systemctl enable nginx
```

## Step 6: Configure Firewall

### Set up UFW firewall:

```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

## Step 7: Clone and Setup Your Application

### Create application directory:

```bash
mkdir -p /var/www
cd /var/www
```

### Clone your repository:

```bash
git clone https://github.com/your-username/hesarak-backend.git hesarakbus
cd hesarakbus
```

### Create production environment file:

```bash
cp .env.example .env
nano .env
```

### Configure your .env file:

```env
# MongoDB Atlas
DATABASE_URI=mongodb://127.0.0.1/your-database-name

# PayloadCMS
PAYLOAD_SECRET=your_very_long_random_secret_key_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# CORS allowed origins (comma-separated)
# Development: Additional origins for development/testing
# Production: Your domain(s) and any additional allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# VPS IP address (for development testing from external devices)
# Set this to your server's public IP when testing on VPS
VPS_IP=your.vps.ip.address

# UploadThing
UPLOADTHING_TOKEN=your_uploadthing_token

# Resend
RESEND_API_KEY=your_resend_api_key

# Other environment variables
NODE_ENV=development

```

### Install dependencies:

```bash
pnpm install
```

### Generate TypeScript types:

```bash
pnpm generate:types
```

### Build the application:

```bash
pnpm build
```

## Step 8: Configure Nginx Reverse Proxy

### Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/hesarakbus
```

### Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Serve Next.js static files
    location /_next/static/ {
        alias /var/www/hesarakbus/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js app
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

    # Increase upload size limit for UploadThing
    client_max_body_size 50M;
}
```

### Enable the site:

```bash
ln -s /etc/nginx/sites-available/hesarakbus /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
systemctl reload nginx
```

## Step 9: Configure PM2 Process Manager

### Start your application with PM2:

```bash
cd /var/www/hesarakbus
pm2 start npm --name "hesarakbus" -- start
```

### Configure PM2 to start on boot:

```bash
pm2 startup
# Follow the instructions output by the command above
pm2 save
```

### Monitor your application:

```bash
pm2 status
pm2 logs hesarakbus
pm2 monit
```

## Step 10: Set Up SSL Certificate (Optional but Recommended)

### Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate:

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Set up auto-renewal:

```bash
crontab -e
```

Add this line:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 11: Final Verification

### Check all services are running:

```bash
systemctl status nginx
pm2 status
```

### Test your application:

- Visit `http://your-domain.com` (or `https://` if SSL is configured)
- Check admin panel at `/admin`
- Test file uploads to ensure UploadThing is working
- Test database connection by creating a user or booking

## Step 12: Maintenance Commands

### Update application:

```bash
cd /var/www/hesarakbus
git pull origin main
pnpm install
pnpm build
pm2 restart hesarakbus
```

### Monitor logs:

```bash
pm2 logs hesarakbus
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Check application health:

```bash
pm2 status
pm2 monit
curl -I http://localhost:3000  # Test if app responds
```

## Troubleshooting

### Application won't start:

```bash
pm2 logs hesarakbus  # Check application logs
cd /var/www/hesarakbus && pnpm dev  # Test in development mode
```

### Database connection issues:

- Check your MongoDB Atlas connection string
- Verify network access settings in MongoDB Atlas
- Test connection with: `node -e "console.log(process.env.DATABASE_URI)"`

### UploadThing issues:

- Verify API keys in environment variables
- Check UploadThing dashboard for usage and errors
- Test file upload in admin panel

### Nginx issues:

```bash
nginx -t  # Test configuration
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### General debugging:

```bash
# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Check system resources
htop
df -h  # Disk space
free -h  # Memory usage
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **MongoDB Atlas**: Use strong passwords and IP whitelisting
3. **Firewall**: Only allow necessary ports (80, 443, 22)
4. **SSL**: Always use HTTPS in production
5. **Updates**: Regularly update system packages and dependencies
6. **UploadThing**: Configure proper file type restrictions and size limits

## Performance Optimization

1. **PM2 Cluster Mode**: Scale to use all CPU cores:

   ```bash
   pm2 delete hesarakbus
   pm2 start ecosystem.config.js
   ```

2. **MongoDB Atlas Indexes**: Create appropriate indexes for your queries in Atlas dashboard

3. **Nginx Caching**: Configure static file caching

4. **Monitoring**: Use PM2 monitoring dashboard or external tools

## Backup Strategy

Since you're using cloud services, backups are handled automatically:

- **MongoDB Atlas**: Automatic backups included in free tier
- **UploadThing**: Files are stored redundantly in cloud
- **Application Code**: Keep in Git repository
- **Environment Variables**: Store securely (consider using a password manager)

## Cost Considerations

- **MongoDB Atlas Free Tier**: 512MB storage, shared CPU
- **UploadThing**: Generous free tier, pay for additional storage/bandwidth
- **DigitalOcean VPS**: $4-6/month for basic droplet
- **Domain**: ~$10-15/year
- **SSL**: Free with Let's Encrypt

---

Your حصارک پنجشیر application should now be fully deployed and running on your DigitalOcean VPS with cloud-hosted database and file storage!
