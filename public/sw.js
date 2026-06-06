const CACHE_NAME = 'ninja-bazaar-v1'
const urlsToCache = ['/', '/favicon.ico', '/manifest.json']

// Cache assets during installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing')
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
      .catch((err) => {
        console.error('Cache opening failed:', err)
      })
  )
  self.skipWaiting()
})

// Clean up old caches during activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating')
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const data = event.notification.data
  const action = event.action

  let urlToOpen = '/'

  if (data && data.conversationId) {
    urlToOpen = `/messages?conversation=${data.conversationId}`
  }

  if (action === 'reply') {
    // Open messages page for reply
    urlToOpen = `/messages?conversation=${data.conversationId}&reply=true`
  } else if (action === 'view') {
    // Just open the conversation
    urlToOpen = `/messages?conversation=${data.conversationId}`
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes('/messages') && 'focus' in client) {
          return client.focus()
        }
      }

      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})

self.addEventListener('push', (event) => {
  console.log('Push received:', event)

  if (!event.data) {
    console.log('No data in push event')
    return
  }

  let data

  try {
    // Try to parse as JSON first
    data = event.data.json()
  } catch (e) {
    console.error('Error parsing push data as JSON:', e)
    // If not JSON, treat as text
    console.log('Failed to parse push data as JSON, treating as text')
    const text = event.data.text()
    data = {
      title: 'New Message',
      body: text,
      data: {},
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data,
    tag: 'message-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'reply',
        title: 'Reply',
      },
      {
        action: 'view',
        title: 'View',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})
