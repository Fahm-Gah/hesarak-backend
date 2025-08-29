// Image caching service worker for bus images
const CACHE_NAME = 'hesarak-bus-images-v1'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Install event - setup cache
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('hesarak-bus-images-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - intercept image requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle bus image requests (you might need to adjust this pattern)
  if (
    event.request.method === 'GET' &&
    (url.pathname.includes('/media/') || url.pathname.includes('/uploads/')) &&
    (url.pathname.includes('.jpg') ||
      url.pathname.includes('.jpeg') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.webp'))
  ) {
    event.respondWith(handleImageRequest(event.request))
  }
})

async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const url = new URL(request.url)
  const cacheKey = `${url.pathname}${url.search}`

  try {
    // Check if we have a cached version
    const cachedResponse = await cache.match(cacheKey)

    if (cachedResponse) {
      // Check if cache is still fresh
      const cachedDate = cachedResponse.headers.get('sw-cached-date')
      const cacheAge = Date.now() - (cachedDate ? parseInt(cachedDate) : 0)

      if (cacheAge < CACHE_DURATION) {
        // Cache is fresh, return it
        return cachedResponse
      }
    }

    // Fetch fresh version
    const networkResponse = await fetch(request, {
      mode: 'cors',
      credentials: 'omit',
    })

    if (networkResponse.ok) {
      // Clone response for caching
      const responseToCache = networkResponse.clone()

      // Add cache timestamp
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cached-date', Date.now().toString())

      const cachedResponseInit = {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      }

      const cachedResponse = new Response(await responseToCache.arrayBuffer(), cachedResponseInit)

      // Cache the response
      await cache.put(cacheKey, cachedResponse.clone())

      return networkResponse
    } else {
      // Network failed, return cached version if available
      if (cachedResponse) {
        return cachedResponse
      }
      throw new Error(`Network response was not ok: ${networkResponse.status}`)
    }
  } catch (error) {
    console.warn('Image cache fetch failed:', error)

    // Try to return cached version as fallback
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      return cachedResponse
    }

    // Return a fallback image or error response
    return new Response(JSON.stringify({ error: 'Image failed to load' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Message handler for cache management
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'PRELOAD_IMAGES') {
    const { imageUrls } = event.data
    await preloadImages(imageUrls)
    event.ports[0].postMessage({ success: true })
  }

  if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    await Promise.all(keys.map((key) => cache.delete(key)))
    event.ports[0].postMessage({ success: true })
  }
})

// Preload images function
async function preloadImages(imageUrls) {
  const cache = await caches.open(CACHE_NAME)

  for (const url of imageUrls) {
    try {
      const cachedResponse = await cache.match(url)
      if (!cachedResponse) {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
        })
        if (response.ok) {
          await cache.put(url, response.clone())
        }
      }
    } catch (error) {
      console.warn('Failed to preload image:', url, error)
    }
  }
}
