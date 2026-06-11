/** User sets PORT in .env. If Next.js blocks it, app runs behind a local proxy. */
const NEXTJS_RESERVED = new Set([6000, 6665, 6666, 6667, 6668, 6669])
const INTERNAL_PORT = 6100

function getPorts(env = process.env) {
  const port = parseInt(env.PORT || '6000', 10)

  if (Number.isNaN(port) || port < 1 || port > 65535) {
    return { publicPort: 6000, appPort: INTERNAL_PORT, useProxy: true }
  }

  if (NEXTJS_RESERVED.has(port)) {
    return { publicPort: port, appPort: INTERNAL_PORT, useProxy: true }
  }

  return { publicPort: port, appPort: port, useProxy: false }
}

module.exports = { getPorts, INTERNAL_PORT }
