const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { resolveAppPort, getPublicPort } = require('./resolve-port.cjs')

const appPort = resolveAppPort()
const publicPort = getPublicPort()
const nextBin = require.resolve('next/dist/bin/next')
const { spawnSync } = require('child_process')

console.log(`[start] Public URL port: ${publicPort} | Next.js running on: ${appPort}`)
if (publicPort !== appPort) {
  console.log(`[start] Use Nginx: ${publicPort} → ${appPort} (see deploy/nginx-port-6000.conf)`)
}

const result = spawnSync(nextBin, ['start', '-p', String(appPort)], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    APP_PORT: String(appPort),
    PORT: String(appPort),
    PUBLIC_PORT: String(publicPort),
    NODE_ENV: 'production',
  },
})

process.exit(result.status ?? 1)
