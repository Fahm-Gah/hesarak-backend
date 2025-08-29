'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ImageOff, Loader2 } from 'lucide-react'

interface OptimizedBusImageProps {
  image: {
    id: string
    url: string
    filename: string
    alt: string
    width: number
    height: number
  }
  index: number
  totalImages: number
  busNumber: string
  onClick: () => void
  priority?: boolean
}

export const OptimizedBusImage = ({
  image,
  index,
  totalImages,
  busNumber,
  onClick,
  priority = false,
}: OptimizedBusImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate a proper blur placeholder based on image aspect ratio
  const generateBlurPlaceholder = (width: number, height: number) => {
    const aspectRatio = height / width
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 40
    canvas.height = Math.round(40 * aspectRatio)

    if (ctx) {
      // Create a subtle gradient that matches the design
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(0.5, '#e5e7eb')
      gradient.addColorStop(1, '#d1d5db')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    return canvas.toDataURL()
  }

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || priority) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Load images when they're 100px from viewport
        threshold: 0.1,
      },
    )

    if (containerRef.current && !priority) {
      observer.observe(containerRef.current)
    } else if (priority) {
      setIsIntersecting(true)
    }

    return () => observer.disconnect()
  }, [priority])

  // Reset states when image changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setImageLoaded(false)
  }, [image.url])

  const handleLoad = () => {
    setIsLoading(false)
    setImageLoaded(true)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const blurDataURL = generateBlurPlaceholder(image.width, image.height)

  return (
    <div
      ref={containerRef}
      className="relative flex-none w-64 md:w-72 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center text-gray-500">
          <ImageOff className="w-12 h-12 mb-2" />
          <span className="text-sm font-medium">تصویر بارگذاری نشد</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setHasError(false)
              setIsLoading(true)
            }}
            className="mt-2 text-xs px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded-full transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Main image */}
      {!hasError && isIntersecting && (
        <>
          <Image
            src={image.url}
            alt={image.alt || `بس ${busNumber} - تصویر ${index + 1}`}
            width={image.width}
            height={image.height}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'scale-100 opacity-100 group-hover:scale-110' : 'scale-95 opacity-0'
            }`}
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL={blurDataURL}
            onLoad={handleLoad}
            onError={handleError}
            quality={85}
          />

          {/* Image loaded overlays */}
          {imageLoaded && (
            <>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image counter */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300">
                {index + 1} / {totalImages}
              </div>

              {/* Click hint */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                کلیک کنید برای مشاهده اندازه کامل
              </div>

              {/* Priority indicator for first image */}
              {priority && index === 0 && (
                <div className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                  اصلی
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
