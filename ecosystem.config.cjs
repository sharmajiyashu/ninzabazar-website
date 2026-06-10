const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const { resolveAppPort } = require('./scripts/resolve-port.cjs')

const appPort = resolveAppPort()
const appName = process.env.PM2_APP_NAME || 'ninjabazaar'

console.log(`[PM2] App will run on port ${appPort}`)

module.exports = {
  apps: [
    {
      name: appName,
      cwd: __dirname,
      script: 'scripts/start-production.cjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: process.env.PM2_MAX_MEMORY || '1G',
      // Do NOT use env_file here — it can re-inject PORT=6000 from .env
      env: {
        NODE_ENV: 'production',
        APP_PORT: String(appPort),
        PORT: String(appPort),
      },
    },
  ],
}
