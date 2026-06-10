const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { resolveAppPort } = require('./resolve-port.cjs')

const port = resolveAppPort()
const nextBin = require.resolve('next/dist/bin/next')
const { spawnSync } = require('child_process')

console.log(`[start] Starting Next.js on port ${port}`)

const result = spawnSync(nextBin, ['start', '-p', String(port)], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    APP_PORT: String(port),
    PORT: String(port),
    NODE_ENV: 'production',
  },
})

process.exit(result.status ?? 1)
