'use client'

// Image caching utilities
export class ImageCacheManager {
  private static instance: ImageCacheManager
  private swRegistration: ServiceWorkerRegistration | null = null
  private isSupported: boolean = false

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator
  }

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager()
    }
    return ImageCacheManager.instance
  }

  async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported, image caching disabled')
      return
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw-image-cache.js', {
        scope: '/',
      })

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      console.log('Image cache service worker registered successfully')
    } catch (error) {
      console.error('Failed to register image cache service worker:', error)
    }
  }

  async preloadImages(imageUrls: string[]): Promise<void> {
    if (!this.isSupported || !navigator.serviceWorker.controller) {
      // Fallback to manual preloading
      return this.fallbackPreload(imageUrls)
    }

    try {
      const messageChannel = new MessageChannel()

      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve()
          } else {
            reject(new Error('Preload failed'))
          }
        }

        navigator.serviceWorker.controller?.postMessage(
          {
            type: 'PRELOAD_IMAGES',
            imageUrls,
          },
          [messageChannel.port2],
        )

        // Timeout after 30 seconds
        setTimeout(() => {
          reject(new Error('Preload timeout'))
        }, 30000)
      })
    } catch (error) {
      console.warn('Service worker preload failed, using fallback:', error)
      return this.fallbackPreload(imageUrls)
    }
  }

  private async fallbackPreload(imageUrls: string[]): Promise<void> {
    const promises = imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // Don't fail entire batch on single image error
        img.src = url
      })
    })

    await Promise.allSettled(promises)
  }

  async clearCache(): Promise<void> {
    if (!this.isSupported || !navigator.serviceWorker.controller) {
      return
    }

    try {
      const messageChannel = new MessageChannel()

      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve()
          } else {
            reject(new Error('Cache clear failed'))
          }
        }

        navigator.serviceWorker.controller?.postMessage(
          {
            type: 'CLEAR_IMAGE_CACHE',
          },
          [messageChannel.port2],
        )

        setTimeout(() => {
          reject(new Error('Cache clear timeout'))
        }, 10000)
      })
    } catch (error) {
      console.warn('Failed to clear service worker cache:', error)
    }
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported
  }
}

// Hook for using image cache in React components
export const useImageCache = () => {
  const manager = ImageCacheManager.getInstance()

  const preloadImages = async (imageUrls: string[]) => {
    try {
      await manager.preloadImages(imageUrls)
      return true
    } catch (error) {
      console.error('Failed to preload images:', error)
      return false
    }
  }

  const clearCache = async () => {
    try {
      await manager.clearCache()
      return true
    } catch (error) {
      console.error('Failed to clear image cache:', error)
      return false
    }
  }

  return {
    preloadImages,
    clearCache,
    isSupported: manager.isServiceWorkerSupported(),
  }
}
