const path = require('path')
const { spawn } = require('child_process')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const { getPorts } = require('./ports.cjs')
const { startPortProxy } = require('./port-proxy.cjs')

const { publicPort, appPort, useProxy } = getPorts()
const nextBin = require.resolve('next/dist/bin/next')
const cwd = path.join(__dirname, '..')

console.log(`[dev] PORT=${publicPort}`)

const child = spawn(nextBin, ['dev', '-p', String(appPort)], {
  stdio: 'inherit',
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
