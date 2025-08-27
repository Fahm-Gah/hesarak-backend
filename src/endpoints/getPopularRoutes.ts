import type { Endpoint, PayloadRequest } from 'payload'
import { calculateDuration } from '@/utils/dateUtils'

// Helper function to format duration without showing zero minutes
const formatDurationClean = (duration: string): string => {
  if (!duration || duration === 'Unknown' || duration === 'نامشخص') {
    return duration
  }

  // Remove zero minutes (e.g., "9h 0m" becomes "9h")
  return duration.replace(/\s0m$/, '')
}

interface PopularRoute {
  from: string
  to: string
  tripsPerWeek: number
  startingPrice: number
  duration: string
}

export const getPopularRoutes: Endpoint = {
  path: '/popular-routes',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const { payload } = req

    try {
      // Get all tickets from the last 7 days for weekly analytics
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // Get recent tickets with trip data
      const recentTickets = await payload.find({
        collection: 'tickets',
        where: {
          and: [
            {
              createdAt: {
                greater_than: sevenDaysAgo.toISOString(),
              },
            },
            { isCancelled: { not_equals: true } },
          ],
        },
        depth: 3,
        limit: 1000, // Get a good sample size
      })

      // Group tickets by route (from province to province)
      const routeStats = new Map<
        string,
        {
          from: string
          to: string
          bookingCount: number
          tripSchedules: Map<string, { frequency: string; days?: string[]; price: number }>
          durations: string[]
        }
      >()

      for (const ticket of recentTickets.docs) {
        const trip = ticket.trip as any
        if (!trip || !trip.from || !ticket.toTerminalName) continue

        // Use province names for routing
        const fromProvince = trip.from.province || trip.from.name
        const toProvince = ticket.toTerminalName.split(',')[1]?.trim() || ticket.toTerminalName

        const routeKey = `${fromProvince}-${toProvince}`

        if (!routeStats.has(routeKey)) {
          routeStats.set(routeKey, {
            from: fromProvince,
            to: toProvince,
            bookingCount: 0,
            tripSchedules: new Map(),
            durations: [],
          })
        }

        const route = routeStats.get(routeKey)!
        route.bookingCount += 1

        // Track unique trip schedules with their frequency and pricing data
        if (!route.tripSchedules.has(trip.id)) {
          route.tripSchedules.set(trip.id, {
            frequency: trip.frequency || 'daily',
            days: trip.days || [],
            price: trip.price || 0,
          })

          // Calculate actual duration from trip schedule
          if (trip.stops && Array.isArray(trip.stops)) {
            // Find the actual duration from departure to the destination terminal
            const departureTime = trip.departureTime // Main departure time

            // Find the stop that matches the destination province
            const destinationStop = trip.stops.find((stop: any) => {
              const stopProvince = stop.terminal?.province || stop.terminal?.name
              return (
                stopProvince?.toLowerCase().includes(toProvince.toLowerCase()) ||
                toProvince.toLowerCase().includes(stopProvince?.toLowerCase())
              )
            })

            if (departureTime && destinationStop?.time) {
              // Calculate duration between departure and destination stop using utility
              const duration = calculateDuration(
                String(departureTime),
                String(destinationStop.time),
              )
              if (duration && duration !== 'Unknown') {
                route.durations.push(formatDurationClean(duration))
              }
            }
          }
        }
      }

      // Convert to array and calculate averages
      const popularRoutes: PopularRoute[] = Array.from(routeStats.entries())
        .map(([_, route]) => {
          // Find the most common duration (mode) from all durations
          let mostCommonDuration = ''
          if (route.durations.length > 0) {
            const durationCounts = route.durations.reduce(
              (acc, duration) => {
                acc[duration] = (acc[duration] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            mostCommonDuration = Object.entries(durationCounts).sort(([, a], [, b]) => b - a)[0][0]
          }

          // Calculate trips per week based on trip schedule frequency
          let tripsPerWeek = 0
          let minPrice = Infinity
          let validPrices = 0

          Array.from(route.tripSchedules.values()).forEach((schedule) => {
            if (schedule.frequency === 'daily') {
              tripsPerWeek += 7 // Daily trips = 7 per week
            } else if (schedule.frequency === 'specific-days' && schedule.days) {
              tripsPerWeek += schedule.days.length // Number of specific days
            } else {
              tripsPerWeek += 1 // Default fallback
            }

            if (schedule.price > 0) {
              minPrice = Math.min(minPrice, schedule.price)
              validPrices++
            }
          })

          return {
            from: route.from,
            to: route.to,
            tripsPerWeek,
            // Starting price (minimum price) from unique trip schedules
            startingPrice: validPrices > 0 ? minPrice : 0,
            // Use the most common actual duration, or provide a fallback
            duration: mostCommonDuration || 'نامشخص',
          }
        })
        .filter((route) => route.startingPrice > 0) // Only include routes with valid pricing data
        .sort((a, b) => b.tripsPerWeek - a.tripsPerWeek) // Sort by actual trips per week
        .slice(0, 6) // Top 6 routes

      // Return only real data, no fallback
      return Response.json({
        success: true,
        data: popularRoutes,
      })
    } catch (error) {
      console.error('Error fetching popular routes:', error)
      return Response.json(
        {
          success: false,
          error: 'Internal server error while fetching popular routes',
        },
        { status: 500 },
      )
    }
  },
}
