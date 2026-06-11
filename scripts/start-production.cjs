const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getPorts } = require('./ports.cjs')
const { startPortProxy } = require('./port-proxy.cjs')
const { spawnNext } = require('./spawn-next.cjs')

const { publicPort, appPort, useProxy } = getPorts()
const cwd = path.join(__dirname, '..')

console.log(`[start] PORT=${publicPort}`)

const child = spawnNext('start', ['-p', String(appPort)], {
  cwd,
  env: {
    ...process.env,
    PORT: String(appPort),
    NODE_ENV: 'production',
  },
})

if (useProxy) {
  setTimeout(() => startPortProxy(publicPort, appPort), 1500)
} else {
  console.log(`[start] http://localhost:${publicPort}`)
}

child.on('exit', (code) => process.exit(code ?? 1))
