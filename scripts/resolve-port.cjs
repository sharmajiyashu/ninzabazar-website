/** Shared port resolver for PM2 + production start */
const NEXTJS_RESERVED_PORTS = new Set([6000, 6665, 6666, 6667, 6668, 6669])
const DEFAULT_APP_PORT = 6100

function resolveAppPort(env = process.env) {
  const raw = env.APP_PORT || env.PORT || String(DEFAULT_APP_PORT)
  const fromEnv = parseInt(raw, 10)

  if (Number.isNaN(fromEnv) || fromEnv < 1 || fromEnv > 65535) {
    console.warn(`[port] Invalid port "${raw}", using ${DEFAULT_APP_PORT}`)
    return DEFAULT_APP_PORT
  }

  if (NEXTJS_RESERVED_PORTS.has(fromEnv)) {
    console.warn(
      `[port] Port ${fromEnv} is blocked by Next.js. Using ${DEFAULT_APP_PORT} instead.`
    )
    console.warn(
      `[port] Set PUBLIC_PORT=${fromEnv} for Nginx, APP_PORT=${DEFAULT_APP_PORT} in .env`
    )
    return DEFAULT_APP_PORT
  }

  return fromEnv
}

module.exports = { resolveAppPort, DEFAULT_APP_PORT }
