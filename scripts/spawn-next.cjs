const path = require('path')
const { spawn } = require('child_process')

function spawnNext(command, args, options = {}) {
  const cwd = options.cwd || path.join(__dirname, '..')
  const nextScript = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next')

  const child = spawn(process.execPath, [nextScript, command, ...args], {
    stdio: 'inherit',
    cwd,
    env: options.env || process.env,
    windowsHide: true,
  })

  child.on('error', (err) => {
    console.error('[next] Failed to start:', err.message)
    process.exit(1)
  })

  return child
}

module.exports = { spawnNext }
