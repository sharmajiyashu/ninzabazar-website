/** Next.js app port — only APP_PORT is used (never 6000) */
const NEXTJS_RESERVED_PORTS = new Set([6000, 6665, 6666, 6667, 6668, 6669])
const DEFAULT_APP_PORT = 6100

function resolveAppPort(env = process.env) {
  const raw = env.APP_PORT || String(DEFAULT_APP_PORT)
  const fromEnv = parseInt(raw, 10)

  if (Number.isNaN(fromEnv) || fromEnv < 1 || fromEnv > 65535) {
    console.warn(`[port] Invalid APP_PORT "${raw}", using ${DEFAULT_APP_PORT}`)
    return DEFAULT_APP_PORT
  }

  if (NEXTJS_RESERVED_PORTS.has(fromEnv)) {
    console.warn(
      `[port] APP_PORT=${fromEnv} is blocked by Next.js. Using ${DEFAULT_APP_PORT}.`
    )
    return DEFAULT_APP_PORT
  }

  return fromEnv
}

function getPublicPort(env = process.env) {
  const raw = env.PUBLIC_PORT || env.PORT || '6000'
  const port = parseInt(raw, 10)
  return Number.isNaN(port) ? 6000 : port
}

module.exports = { resolveAppPort, getPublicPort, DEFAULT_APP_PORT }
