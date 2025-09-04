#!/bin/bash

# Deployment script for Hesarak Backend
# This script should be placed on your Digital Ocean droplet

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Configuration
PROJECT_DIR="/var/www/hesarak-backend"  # Adjust this path
PM2_APP_NAME="hesarak-backend"
LOG_FILE="/var/log/hesarak-deploy.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "📦 Pulling latest changes from GitHub..."
cd "$PROJECT_DIR"
git pull origin main

log "📥 Installing dependencies..."
pnpm install --frozen-lockfile

log "🔧 Generating types..."
pnpm generate:types

log "🏗️ Building application..."
pnpm build

log "♻️ Restarting application with PM2..."
pm2 restart "$PM2_APP_NAME" || pm2 start pnpm --name "$PM2_APP_NAME" -- start

log "💾 Saving PM2 process list..."
pm2 save

# Optional: Reload nginx
if systemctl is-active --quiet nginx; then
    log "🔄 Reloading Nginx..."
    sudo nginx -t && sudo systemctl reload nginx
fi

log "✅ Deployment completed successfully!"

# Send success notification
if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    curl -X POST -H "Content-Type: application/json" \
      -d "{\"content\":\"✅ Deployment successful for hesarak-backend\nBranch: main\nTime: $(date)\"}" \
      "$DISCORD_WEBHOOK_URL"
fi

# Send failure notification (add this to error handling)
trap 'catch_error' ERR
catch_error() {
    log "❌ Deployment failed!"
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H "Content-Type: application/json" \
          -d "{\"content\":\"❌ Deployment FAILED for hesarak-backend\nCheck logs: pm2 logs hesarak-backend\"}" \
          "$DISCORD_WEBHOOK_URL"
    fi
    exit 1
}