'use client'

import { useEffect, useRef, useState } from 'react'

interface UseImagePreloaderOptions {
  images: Array<{ url: string; priority?: boolean }>
  rootMargin?: string
  threshold?: number
}

export const useImagePreloader = ({
  images,
  rootMargin = '50px',
  threshold = 0.1,
}: UseImagePreloaderOptions) => {
  const [loadedImages, setLoadedImages] = useState(new Set<string>())
  const [failedImages, setFailedImages] = useState(new Set<string>())
  const observerRef = useRef<IntersectionObserver | null>(null)
  const preloadQueueRef = useRef(new Set<string>())

  // Preload image function
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(url) || failedImages.has(url)) {
        resolve()
        return
      }

      const img = new Image()

      img.onload = () => {
        setLoadedImages((prev) => new Set([...prev, url]))
        resolve()
      }

      img.onerror = () => {
        setFailedImages((prev) => new Set([...prev, url]))
        reject(new Error(`Failed to load image: ${url}`))
      }

      // Set loading timeout
      setTimeout(() => {
        if (!loadedImages.has(url) && !failedImages.has(url)) {
          img.src = '' // Cancel loading
          setFailedImages((prev) => new Set([...prev, url]))
          reject(new Error(`Image loading timeout: ${url}`))
        }
      }, 10000) // 10 second timeout

      img.src = url
    })
  }

  // Process preload queue
  const processPreloadQueue = async () => {
    const urls = Array.from(preloadQueueRef.current)
    preloadQueueRef.current.clear()

    // Process in batches to avoid overwhelming the network
    const batchSize = 2
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      await Promise.allSettled(batch.map((url) => preloadImage(url)))

      // Small delay between batches
      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
  }

  // Queue image for preloading
  const queueImageForPreload = (url: string) => {
    if (!loadedImages.has(url) && !failedImages.has(url)) {
      preloadQueueRef.current.add(url)
    }
  }

  // Create intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-src')
            if (url) {
              queueImageForPreload(url)
            }
          }
        })
      },
      {
        rootMargin,
        threshold,
      },
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [rootMargin, threshold])

  // Preload priority images immediately
  useEffect(() => {
    const priorityImages = images.filter((img) => img.priority).map((img) => img.url)
    if (priorityImages.length > 0) {
      priorityImages.forEach((url) => queueImageForPreload(url))
      processPreloadQueue()
    }
  }, [images])

  // Process queue when new images are added
  useEffect(() => {
    if (preloadQueueRef.current.size > 0) {
      const timeoutId = setTimeout(processPreloadQueue, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [preloadQueueRef.current.size])

  // Observe element for lazy loading
  const observeElement = (element: HTMLElement | null, imageUrl: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-src', imageUrl)
      observerRef.current.observe(element)
    }
  }

  // Unobserve element
  const unobserveElement = (element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.unobserve(element)
    }
  }

  // Check if image is loaded
  const isImageLoaded = (url: string) => loadedImages.has(url)

  // Check if image failed to load
  const isImageFailed = (url: string) => failedImages.has(url)

  // Manual preload trigger
  const preloadImages = (urls: string[]) => {
    urls.forEach((url) => queueImageForPreload(url))
    return processPreloadQueue()
  }

  return {
    isImageLoaded,
    isImageFailed,
    observeElement,
    unobserveElement,
    preloadImages,
    loadedCount: loadedImages.size,
    failedCount: failedImages.size,
    totalCount: images.length,
  }
}
