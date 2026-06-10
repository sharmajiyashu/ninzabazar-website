const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const RESERVED_PORTS = new Set([6000, 6665, 6666, 6667, 6668, 6669])

function resolvePort() {
  const fromEnv = parseInt(process.env.PORT || '6100', 10)

  if (Number.isNaN(fromEnv) || fromEnv < 1 || fromEnv > 65535) {
    console.warn('[start] Invalid PORT in .env, using 6100')
    return 6100
  }

  if (RESERVED_PORTS.has(fromEnv)) {
    console.warn(
      `[start] PORT=${fromEnv} is blocked by Next.js. Using 6100 instead.`
    )
    console.warn(
      `[start] Use Nginx on ${fromEnv} → proxy to 6100 (see deploy/nginx-port-6000.conf)`
    )
    return 6100
  }

  return fromEnv
}

const port = resolvePort()
const nextBin = require.resolve('next/dist/bin/next')
const { spawnSync } = require('child_process')

const result = spawnSync(nextBin, ['start', '-p', String(port)], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
  },
})

process.exit(result.status ?? 1)
