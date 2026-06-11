const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getPorts } = require('./ports.cjs')
const { startPortProxy } = require('./port-proxy.cjs')
const { spawnNext } = require('./spawn-next.cjs')

const { publicPort, appPort, useProxy } = getPorts()
const cwd = path.join(__dirname, '..')

console.log(`[dev] PORT=${publicPort}`)

const child = spawnNext('dev', ['-p', String(appPort)], {
  cwd,
  env: {
    ...process.env,
    PORT: String(appPort),
    NODE_ENV: 'development',
  },
})

if (useProxy) {
  setTimeout(() => startPortProxy(publicPort, appPort), 2000)
} else {
  console.log(`[dev] http://localhost:${publicPort}`)
}

child.on('exit', (code) => process.exit(code ?? 1))
