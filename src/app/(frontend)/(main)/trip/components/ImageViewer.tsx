import React, { useEffect, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Zoom, Keyboard, A11y } from 'swiper/modules'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

interface ImageData {
  id: string
  url: string
  filename: string
  alt: string
  width: number
  height: number
}

interface ImageViewerProps {
  images: ImageData[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  busNumber: string
}

export const ImageViewer = ({
  images,
  initialIndex,
  isOpen,
  onClose,
  busNumber,
}: ImageViewerProps) => {
  const router = useRouter()

  // Handle browser back button to close image viewer
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'

      // Add a history entry when opening the image viewer
      const currentUrl = window.location.href
      const baseUrl = currentUrl.split('#')[0] // Remove any existing hash
      const imageViewerUrl = baseUrl + '#image-viewer'
      window.history.pushState({ imageViewer: true }, '', imageViewerUrl)

      // Handle popstate (back button)
      const handlePopState = (event: PopStateEvent) => {
        // Close the image viewer when navigating back
        if (!event.state?.imageViewer) {
          handleClose()
        }
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
        document.body.style.overflow = 'unset'

        // Clean up URL if component unmounts while open
        if (window.location.hash === '#image-viewer') {
          const cleanUrl = window.location.href.split('#')[0]
          window.history.replaceState(null, '', cleanUrl)
        }
      }
    } else {
      document.body.style.overflow = 'unset'

      // Clean up URL when closing
      if (window.location.hash === '#image-viewer') {
        const cleanUrl = window.location.href.split('#')[0]
        window.history.replaceState(null, '', cleanUrl)
      }
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Remove the history entry when closing with ESC
        if (window.location.hash === '#image-viewer') {
          window.history.back()
        } else {
          handleClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  // Handle close button click
  const handleCloseClick = useCallback(() => {
    if (window.location.hash === '#image-viewer') {
      window.history.back()
    } else {
      handleClose()
    }
  }, [handleClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <h3 className="text-xl font-bold">Bus {busNumber} Gallery</h3>
            <p className="text-sm text-gray-300">
              Image {initialIndex + 1} of {images.length}
            </p>
          </div>

          <button
            onClick={handleCloseClick}
            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Swiper */}
      <div className="w-full h-full pt-24 pb-8">
        <Swiper
          modules={[Pagination, Zoom, Keyboard, A11y]}
          initialSlide={initialIndex}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          zoom={{
            maxRatio: 2.5,
            minRatio: 1,
            toggle: true,
          }}
          keyboard={{
            enabled: true,
          }}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          loop={images.length > 1}
          className="w-full h-full"
          style={
            {
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#f97316',
              '--swiper-pagination-bullet-inactive-color': '#fff',
              '--swiper-pagination-bullet-inactive-opacity': '0.5',
            } as React.CSSProperties
          }
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.id} className="flex items-center justify-center">
              <div className="swiper-zoom-container relative max-w-full max-h-full">
                <Image
                  src={image.url}
                  alt={image.alt || `Bus ${busNumber} - Image ${index + 1}`}
                  width={image.width}
                  height={image.height}
                  className="max-w-full max-h-full object-contain rounded-none md:rounded-lg shadow-2xl"
                  priority={index === initialIndex}
                  loading={index === initialIndex ? 'eager' : 'lazy'}
                  sizes="100vw"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
