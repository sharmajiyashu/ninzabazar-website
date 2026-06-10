const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

/** Ports Next.js refuses to bind (see nextjs.org/docs/messages/reserved-port) */
const NEXTJS_RESERVED_PORTS = new Set([6000, 6665, 6666, 6667, 6668, 6669])

function resolveAppPort() {
  const fromEnv = parseInt(process.env.PORT || '6100', 10)

  if (Number.isNaN(fromEnv) || fromEnv < 1 || fromEnv > 65535) {
    console.warn('[PM2] Invalid PORT in .env, using 6100')
    return 6100
  }

  if (NEXTJS_RESERVED_PORTS.has(fromEnv)) {
    console.warn(
      `[PM2] PORT=${fromEnv} is blocked by Next.js. Running app on 6100 instead.`
    )
    console.warn(
      `[PM2] Use Nginx on ${fromEnv} → proxy to 6100 (deploy/nginx-port-6000.conf)`
    )
    return 6100
  }

  return fromEnv
}

const appPort = resolveAppPort()
const appName = process.env.PM2_APP_NAME || 'ninjabazaar'

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
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: String(appPort),
      },
    },
  ],
}
