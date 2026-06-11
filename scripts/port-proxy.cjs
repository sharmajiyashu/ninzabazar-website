const http = require('http')
const net = require('net')

function startPortProxy(publicPort, appPort) {
  const server = http.createServer((req, res) => {
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: appPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${appPort}`,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers)
        proxyRes.pipe(res)
      }
    )

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(502)
        res.end('App not ready yet')
      }
    })

    req.pipe(proxyReq)
  })

  server.on('upgrade', (req, clientSocket, head) => {
    const serverSocket = net.connect(appPort, '127.0.0.1', () => {
      const lines = [`${req.method} ${req.url} HTTP/${req.httpVersion}`]
      for (const [key, value] of Object.entries(req.headers)) {
        lines.push(`${key}: ${value}`)
      }
      serverSocket.write(lines.join('\r\n') + '\r\n\r\n')
      if (head && head.length) serverSocket.write(head)
      serverSocket.pipe(clientSocket)
      clientSocket.pipe(serverSocket)
    })

    serverSocket.on('error', () => clientSocket.destroy())
    clientSocket.on('error', () => serverSocket.destroy())
  })

  server.listen(publicPort, '0.0.0.0', () => {
    console.log(`[proxy] http://0.0.0.0:${publicPort} → ${appPort}`)
  })

  return server
}

module.exports = { startPortProxy }
