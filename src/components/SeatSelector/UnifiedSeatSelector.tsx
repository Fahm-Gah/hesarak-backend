import { Suspense } from 'react'
import { SeatSelectorClient } from './index.client'
import { ServerSeatSelector } from './ServerSeatSelector'

interface UnifiedSeatSelectorProps {
  // Required for server-side rendering
  tripId?: string
  travelDate?: string

  // PayloadCMS field props
  path?: string
  readOnly?: boolean

  // Optional props
  onSeatSelect?: (seatIds: string[]) => void
  initialSelectedSeats?: string[]

  // Control rendering mode
  enableServerRendering?: boolean
}

/**
 * Unified SeatSelector component that can work in both server and client contexts.
 * - When tripId and travelDate are provided with enableServerRendering=true, uses ServerSeatSelector for immediate blocked seat visibility
 * - Otherwise uses SeatSelectorClient for PayloadCMS admin or client-only contexts
 */
export function UnifiedSeatSelector({
  tripId,
  travelDate,
  path = 'seats',
  readOnly = false,
  onSeatSelect,
  initialSelectedSeats,
  enableServerRendering = true,
}: UnifiedSeatSelectorProps) {
  // Use server rendering when we have the required data and it's enabled
  const useServerRendering =
    enableServerRendering && tripId && travelDate && typeof window === 'undefined' // Ensure we're on the server

  if (useServerRendering) {
    return (
      <Suspense
        fallback={
          <div className="seat-selector-wrapper">
            <div className="seat-selector__container">
              <div className="seat-selector__grid-wrapper">
                <div className="seat-selector-loading">
                  <div className="seat-selector__loading-skeleton" />
                  Loading seat map...
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ServerSeatSelector
          tripId={tripId}
          travelDate={travelDate}
          onSeatSelect={onSeatSelect}
          selectedSeats={initialSelectedSeats}
          readOnly={readOnly}
        />
      </Suspense>
    )
  }

  // Fall back to client-only rendering
  return (
    <SeatSelectorClient
      path={path}
      readOnly={readOnly}
      onSeatSelect={onSeatSelect}
      initialSelectedSeats={initialSelectedSeats}
    />
  )
}

export default UnifiedSeatSelector
