import type { PayloadRequest, Endpoint } from 'payload'
import { validateDate, getDayOfWeek, formatTime } from '@/utils/dateUtils'

export const tripDetailsEndpoint: Endpoint = {
  path: '/:tripId/:date/details',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const tripId = req.routeParams?.tripId as string
    const dateParam = req.routeParams?.date as string

    if (!tripId || !dateParam) {
      return Response.json(
        {
          success: false,
          error: 'Trip ID and date are required',
        },
        { status: 400 },
      )
    }

    try {
      // 1) Validate date
      const { isValid, date: travelDate, error: dateErr } = validateDate(dateParam)
      if (!isValid || !travelDate) {
        return Response.json(
          {
            success: false,
            error: dateErr || 'Invalid date format',
          },
          { status: 400 },
        )
      }

      // 2) Load schedule
      const tripSchedule = await req.payload.findByID({
        collection: 'trip-schedules',
        id: tripId,
        depth: 3,
      })

      if (!tripSchedule) {
        return Response.json(
          {
            success: false,
            error: 'Trip not found',
          },
          { status: 404 },
        )
      }

      if (!tripSchedule.isActive) {
        return Response.json(
          {
            success: false,
            error: 'Trip not currently active',
          },
          { status: 400 },
        )
      }

      // 3) Check running day
      const dayCode = getDayOfWeek(dateParam)
      if (
        tripSchedule.frequency === 'specific-days' &&
        !(tripSchedule.days || []).some((d) => d.day === dayCode)
      ) {
        return Response.json(
          {
            success: false,
            error: 'Trip does not run on the selected date',
          },
          { status: 400 },
        )
      }

      // 4) Build date-range
      const startOfDay = new Date(travelDate)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(startOfDay)
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1)

      // 5) Fetch booked tickets
      const { docs: booked } = await req.payload.find({
        collection: 'tickets',
        where: {
          and: [
            { trip: { equals: tripId } },
            { date: { greater_than_equal: startOfDay.toISOString() } },
            { date: { less_than: endOfDay.toISOString() } },
            { status: { not_equals: 'cancelled' } },
          ],
        },
        depth: 0,
        limit: 1000,
      })

      // 6) Collect booked seat labels
      const bookedSeatLabels = booked
        .flatMap((t) => (t.bookedSeats || []).map((s) => s.seatLabel))
        .filter(Boolean)

      // 7) Seat layout
      const bus = typeof tripSchedule.busType === 'object' ? tripSchedule.busType : null
      const allSeats = Array.isArray(bus?.seats) ? bus.seats : []

      const seatsWithAvailability = allSeats.map((seat) => ({
        id: seat.id,
        label: seat.label,
        row: seat.row,
        col: seat.col,
        isBooked: bookedSeatLabels.includes(seat.label),
        isAvailable: !bookedSeatLabels.includes(seat.label),
      }))

      // 8) Counts
      const totalSeats = allSeats.length
      const bookedCount = bookedSeatLabels.length
      const availableCount = totalSeats - bookedCount

      // 9) Build response
      const tripDetails = {
        id: tripSchedule.id,
        name: tripSchedule.name,
        travelDate: startOfDay.toISOString().split('T')[0],
        price: tripSchedule.price,
        departureTime: formatTime(tripSchedule.timeOfDay),
        frequency: tripSchedule.frequency,
        isActive: tripSchedule.isActive,
        from: {
          id:
            typeof tripSchedule.from === 'object' && tripSchedule.from ? tripSchedule.from.id : '',
          province:
            typeof tripSchedule.from === 'object' && tripSchedule.from
              ? tripSchedule.from.province
              : '',
          address:
            typeof tripSchedule.from === 'object' && tripSchedule.from
              ? tripSchedule.from.address
              : '',
        },
        to:
          tripSchedule.stops && tripSchedule.stops.length > 0
            ? (() => {
                const lastStop = tripSchedule.stops[tripSchedule.stops.length - 1]
                const terminal = typeof lastStop.terminal === 'object' ? lastStop.terminal : null
                return {
                  id: terminal ? terminal.id : '',
                  province: terminal ? terminal.province : '',
                  address: terminal ? terminal.address : '',
                }
              })()
            : {
                id: '',
                province: '',
                address: '',
              },
        stops: (tripSchedule.stops || []).map((s) => ({
          terminal:
            typeof s.terminal === 'object'
              ? { id: s.terminal.id, province: s.terminal.province, address: s.terminal.address }
              : { id: s.terminal, province: '', address: '' },
          time: formatTime(s.time),
        })),
        bus: bus
          ? {
              id: bus.id,
              name: bus.name,
              capacity: bus.capacity,
              image: bus.image ?? null,
              amenities: (bus.amenities || []).map((a) => a.name),
            }
          : null,
        seats: seatsWithAvailability,
        seatLayout: {
          totalSeats,
          bookedSeats: bookedCount,
          availableSeats: availableCount,
          bookedSeatLabels,
        },
        maxSeatsPerBooking: Math.min(availableCount, 6),
        minSeatsPerBooking: 1,
        lastUpdated: new Date().toISOString(),
      }

      return Response.json({ success: true, data: tripDetails }, { status: 200 })
    } catch (error) {
      console.error('Error fetching trip details:', error)
      return Response.json(
        {
          success: false,
          error: 'An error occurred while fetching trip details',
        },
        { status: 500 },
      )
    }
  },
}
