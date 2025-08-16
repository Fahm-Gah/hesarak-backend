'use client'

import React, { useState, useEffect } from 'react'
import { useLocationCapture } from '@/hooks/useLocationCapture'

interface StatusIndicatorProps {
  status: PermissionState
  loading: boolean
  error?: string | null
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, loading, error }) => {
  const getStatusConfig = (status: PermissionState) => {
    switch (status) {
      case 'granted':
        return { color: 'success', icon: '✅', label: 'Granted' }
      case 'denied':
        return { color: 'error', icon: '❌', label: 'Denied' }
      case 'prompt':
        return { color: 'warning', icon: '❓', label: 'Prompt' }
      default:
        return { color: 'info', icon: '⏳', label: 'Unknown' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className="location-demo__status">
      <div className={`location-demo__status-item location-demo__status-item--${config.color}`}>
        <span className="location-demo__status-icon">{config.icon}</span>
        <span className="location-demo__status-label">Permission:</span>
        <span className="location-demo__status-value">{config.label}</span>
      </div>

      <div className="location-demo__status-item">
        <span className="location-demo__status-icon">{loading ? '⏳' : '💤'}</span>
        <span className="location-demo__status-label">Loading:</span>
        <span className="location-demo__status-value">{loading ? 'Yes' : 'No'}</span>
      </div>

      {error && (
        <div className="location-demo__status-item location-demo__status-item--error">
          <span className="location-demo__status-icon">⚠️</span>
          <span className="location-demo__status-label">Error:</span>
          <span className="location-demo__status-value">{error}</span>
        </div>
      )}
    </div>
  )
}

interface LocationDataDisplayProps {
  location: any
}

const LocationDataDisplay: React.FC<LocationDataDisplayProps> = ({ location }) => {
  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`
  }

  const formatAccuracy = (accuracy: number) => {
    return `~${accuracy.toFixed(0)}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getSourceDisplay = (source: string) => {
    return source === 'browser' ? '📱 Browser GPS' : '🌐 IP Geolocation'
  }

  return (
    <div className="location-demo__data">
      <h3 className="location-demo__data-title">📍 Location Data</h3>

      <div className="location-demo__data-grid">
        <div className="location-demo__data-item">
          <span className="location-demo__data-label">Source:</span>
          <span className="location-demo__data-value">{getSourceDisplay(location.source)}</span>
        </div>

        {location.coordinates && (
          <div className="location-demo__data-item location-demo__data-item--full">
            <span className="location-demo__data-label">Coordinates:</span>
            <span className="location-demo__data-value location-demo__data-value--mono">
              {formatCoordinates(location.coordinates)}
            </span>
          </div>
        )}

        {location.accuracy && (
          <div className="location-demo__data-item">
            <span className="location-demo__data-label">Accuracy:</span>
            <span className="location-demo__data-value">{formatAccuracy(location.accuracy)}</span>
          </div>
        )}

        {location.city && (
          <div className="location-demo__data-item">
            <span className="location-demo__data-label">City:</span>
            <span className="location-demo__data-value">{location.city}</span>
          </div>
        )}

        {location.country && (
          <div className="location-demo__data-item">
            <span className="location-demo__data-label">Country:</span>
            <span className="location-demo__data-value">{location.country}</span>
          </div>
        )}

        {location.region && (
          <div className="location-demo__data-item">
            <span className="location-demo__data-label">Region:</span>
            <span className="location-demo__data-value">{location.region}</span>
          </div>
        )}

        {location.timezone && (
          <div className="location-demo__data-item">
            <span className="location-demo__data-label">Timezone:</span>
            <span className="location-demo__data-value">{location.timezone}</span>
          </div>
        )}

        {location.ipAddress && (
          <div className="location-demo__data-item location-demo__data-item--full">
            <span className="location-demo__data-label">IP Address:</span>
            <span className="location-demo__data-value location-demo__data-value--mono">
              {location.ipAddress}
            </span>
          </div>
        )}

        {location.lastUpdated && (
          <div className="location-demo__data-item location-demo__data-item--full">
            <span className="location-demo__data-label">Last Updated:</span>
            <span className="location-demo__data-value location-demo__data-value--mono">
              {formatDate(location.lastUpdated)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface DebugSectionProps {
  permissionStatus: PermissionState
  loading: boolean
  error: string | null
  location: any
  userId: string
}

const DebugSection: React.FC<DebugSectionProps> = ({
  permissionStatus,
  loading,
  error,
  location,
  userId,
}) => {
  const [contextInfo, setContextInfo] = useState<any>({})
  const [isClient, setIsClient] = useState(false)
  const [debugTimestamp, setDebugTimestamp] = useState<string>('')

  useEffect(() => {
    // Mark as client-side rendered to prevent hydration mismatch
    setIsClient(true)
    setDebugTimestamp(new Date().toISOString())

    // Gather browser context information
    if (typeof window !== 'undefined') {
      setContextInfo({
        isSecureContext: window.isSecureContext,
        hasGeolocation: !!navigator.geolocation,
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        platform: navigator.platform,
        windowSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
        },
      })
    }
  }, [])

  // Don't render on server or in production
  if (!isClient || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <section className="location-demo__section">
      <details className="location-demo__debug">
        <summary className="location-demo__debug-summary">🐛 Debug Information</summary>
        <div className="location-demo__debug-content">
          <pre className="location-demo__debug-data">
            {JSON.stringify(
              {
                state: {
                  permissionStatus,
                  loading,
                  error,
                  userId,
                  hasLocation: !!location,
                },
                location: location || null,
                context: contextInfo,
                environment: {
                  nodeEnv: process.env.NODE_ENV,
                  timestamp: debugTimestamp,
                  isClient,
                },
              },
              null,
              2,
            )}
          </pre>
        </div>
      </details>
    </section>
  )
}

/**
 * Client Component for Location Demo
 *
 * This component handles all browser-specific functionality:
 * - Location capture hooks
 * - Interactive buttons
 * - Real-time status updates
 * - Browser API interactions
 */
export function LocationDemoClient() {
  const [userId, setUserId] = useState<string>('') // Could be set from auth context
  const { location, loading, error, permissionStatus, captureLocation, refresh } =
    useLocationCapture(userId, { autoCapture: false })

  const handleCaptureLocation = async () => {
    try {
      await captureLocation()
    } catch (err) {
      console.error('Failed to capture location:', err)
    }
  }

  const handleRefresh = async () => {
    try {
      await refresh()
    } catch (err) {
      console.error('Failed to refresh location:', err)
    }
  }

  return (
    <>
      {/* Status Section */}
      <section className="location-demo__section">
        <h2 className="location-demo__section-title">📊 System Status</h2>
        <StatusIndicator status={permissionStatus} loading={loading} error={error} />
      </section>

      {/* Location Data Section */}
      {location && (
        <section className="location-demo__section">
          <LocationDataDisplay location={location} />
        </section>
      )}

      {/* Actions Section */}
      <section className="location-demo__section">
        <h2 className="location-demo__section-title">🎮 Actions</h2>
        <div className="location-demo__actions">
          <button
            onClick={handleCaptureLocation}
            disabled={loading}
            className={`location-demo__button location-demo__button--primary ${
              loading ? 'location-demo__button--loading' : ''
            }`}
            aria-label="Capture current location"
          >
            {loading ? (
              <>
                <span className="location-demo__button-spinner">⏳</span>
                Capturing...
              </>
            ) : (
              <>
                <span className="location-demo__button-icon">📍</span>
                Capture Location
              </>
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`location-demo__button location-demo__button--secondary ${
              loading ? 'location-demo__button--loading' : ''
            }`}
            aria-label="Force refresh location data"
          >
            {loading ? (
              <>
                <span className="location-demo__button-spinner">⏳</span>
                Refreshing...
              </>
            ) : (
              <>
                <span className="location-demo__button-icon">🔄</span>
                Force Refresh
              </>
            )}
          </button>
        </div>
      </section>

      {/* Debug Section (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugSection
          permissionStatus={permissionStatus}
          loading={loading}
          error={error}
          location={location}
          userId={userId}
        />
      )}
    </>
  )
}
