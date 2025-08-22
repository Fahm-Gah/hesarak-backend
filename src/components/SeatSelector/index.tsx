// Export client components for PayloadCMS
export { SeatSelectorField as default, SeatSelectorField } from './index.client'
export { default as SeatSelectorClient } from './index.client'

// Export server component for frontend usage
export { ServerSeatSelector } from './ServerSeatSelector'

// Export a unified component that can be used in both contexts
export { UnifiedSeatSelector } from './UnifiedSeatSelector'

export type * from './types'
