import { AudioPlayer } from '../utils/audioPlayer'

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: string | Record<string, unknown>
  sound?: string
}

interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: Array<{
    action: string
    title: string
  }>
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      // First check if the service worker is already registered
      const registrations = await navigator.serviceWorker.getRegistrations()
      let registration = registrations.find(
        (reg) => reg.active && reg.active.scriptURL.includes('/sw.js')
      )

      if (!registration) {
        // If not found, register it
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        console.log('Service Worker registered successfully')
      } else {
        console.log('Service Worker already registered')
      }

      this.registration = registration
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      this.registration = null
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }

  isDocumentVisible(): boolean {
    if (typeof document === 'undefined') return false

    return document.visibilityState === 'visible' && document.hasFocus()
  }

  async showNotification(payload: PushNotificationPayload): Promise<void> {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('📲 Notifications not supported in this browser')
      return
    }

    const permission = await this.requestPermission()

    if (permission !== 'granted') {
      console.warn('📲 Push notification permission denied')
      return
    }

    // Play notification sound if provided
    if (payload.sound) {
      AudioPlayer.getInstance().play(payload.sound)
    }

    if (this.registration) {
      try {
        await this.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          data: payload.data,
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
        } as ExtendedNotificationOptions)
        console.log('📲 Notification successfully displayed')
      } catch (error) {
        console.error('📲 Error showing notification:', error)
        this.showFallbackNotification(payload)
      }
    } else {
      this.showFallbackNotification(payload)
    }
  }

  private showFallbackNotification(payload: PushNotificationPayload): void {
    try {
      if (payload.sound && !this.registration) {
        AudioPlayer.getInstance().play(payload.sound)
      }

      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon,
      })

      // Add click handler for regular notifications
      notification.onclick = () => {
        if (payload.data && typeof payload.data === 'object') {
          window.focus()
        }
      }

      console.log('📲 Browser notification displayed')
    } catch (error) {
      console.error('📲 Error showing browser notification:', error)
    }
  }
}
