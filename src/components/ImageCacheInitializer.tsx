'use client'

import { useEffect } from 'react'
import { ImageCacheManager } from '@/utils/imageCache'

export const ImageCacheInitializer = () => {
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const cacheManager = ImageCacheManager.getInstance()
        await cacheManager.initialize()
      } catch (error) {
        console.warn('Failed to initialize image cache:', error)
      }
    }

    initializeCache()
  }, [])

  return null // This component doesn't render anything
}
