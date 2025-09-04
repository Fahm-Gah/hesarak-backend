#!/bin/bash

# Quick deployment status check script

echo "🔍 Checking deployment status..."

# Check if PM2 app is running
if pm2 show hesarak-backend > /dev/null 2>&1; then
    echo "✅ App is running"
    pm2 show hesarak-backend | grep -E "status|uptime|restarts"
else
    echo "❌ App is NOT running"
fi

# Check last deployment log
echo -e "\n📋 Last deployment log:"
tail -n 20 /var/log/hesarak-deploy.log 2>/dev/null || echo "No deployment log found"

# Check recent git commits
echo -e "\n📦 Latest commit:"
cd /var/www/hesarak-backend && git log -1 --oneline

# Check app health
echo -e "\n🏥 App health check:"
curl -s http://localhost:3000/api/health || echo "Health check failed"