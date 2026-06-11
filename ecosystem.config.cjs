const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const { getPorts } = require('./scripts/ports.cjs')
const { publicPort } = getPorts()

module.exports = {
  apps: [
    {
      name: 'ninjabazaar',
      cwd: __dirname,
      script: 'scripts/start-production.cjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PORT: String(publicPort),
      },
    },
  ],
}
