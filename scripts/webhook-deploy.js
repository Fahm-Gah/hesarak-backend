#!/usr/bin/env node

/**
 * Webhook handler for GitHub push events
 * Optional alternative to GitHub Actions
 */

const express = require('express')
const crypto = require('crypto')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

const app = express()
const PORT = process.env.WEBHOOK_PORT || 9000
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret'
const DEPLOY_SCRIPT = '/var/www/hesarak-backend/scripts/deploy.sh'

app.use(express.json())

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// Webhook endpoint
app.post('/webhook/deploy', async (req, res) => {
  const signature = req.headers['x-hub-signature-256']

  // Verify signature
  if (!signature || !verifySignature(req.body, signature)) {
    console.error('Invalid signature')
    return res.status(401).send('Unauthorized')
  }

  // Check if it's a push to main branch
  if (req.body.ref !== 'refs/heads/main') {
    console.log('Not a push to main branch, ignoring')
    return res.status(200).send('Not main branch')
  }

  console.log('Valid webhook received, starting deployment...')

  // Respond immediately
  res.status(200).send('Deployment started')

  // Execute deployment asynchronously
  try {
    const { stdout, stderr } = await execAsync(DEPLOY_SCRIPT)
    console.log('Deployment output:', stdout)
    if (stderr) console.error('Deployment errors:', stderr)
    console.log('Deployment completed successfully')
  } catch (error) {
    console.error('Deployment failed:', error)
    // You could send notification here (email, Discord, etc.)
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`)
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/deploy`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})
