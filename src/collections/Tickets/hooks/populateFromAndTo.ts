import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Hook to automatically populate from/to terminal fields and their names
 * from the selected trip schedule.
 *
 * This runs before the document is saved and extracts:
 * - from: The starting terminal from trip.from
 * - to: The last terminal from trip.stops (final destination)
 * - fromTerminalName: Name of the starting terminal (for search)
 * - toTerminalName: Name of the final terminal (for search)
 */
export const populateFromAndTo: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // Only run on create and update operations
  if (operation !== 'create' && operation !== 'update') {
    return data
  }

  // Skip if no trip is selected
  if (!data?.trip) {
    return data
  }

  try {
    // Get the trip schedule with populated terminals
    const tripSchedule = await req.payload.findByID({
      collection: 'trip-schedules',
      id: typeof data.trip === 'string' ? data.trip : data.trip.id,
      depth: 2, // Populate terminals in from and stops
    })

    if (!tripSchedule) {
      console.warn('populateFromAndTo: Trip schedule not found')
      return data
    }

    // Only populate from terminal if not already set (respect user-provided terminals)
    if (!data.from && tripSchedule.from) {
      const fromTerminal =
        typeof tripSchedule.from === 'string' ? tripSchedule.from : tripSchedule.from.id

      const fromTerminalName =
        typeof tripSchedule.from === 'string' ? undefined : tripSchedule.from.name

      data.from = fromTerminal
      if (fromTerminalName) {
        data.fromTerminalName = fromTerminalName
      }
    }

    // Only populate to terminal if not already set (respect user-provided terminals)
    if (
      !data.to &&
      tripSchedule.stops &&
      Array.isArray(tripSchedule.stops) &&
      tripSchedule.stops.length > 0
    ) {
      const lastStop = tripSchedule.stops[tripSchedule.stops.length - 1]

      if (lastStop?.terminal) {
        const toTerminal =
          typeof lastStop.terminal === 'string' ? lastStop.terminal : lastStop.terminal.id

        const toTerminalName =
          typeof lastStop.terminal === 'string' ? undefined : lastStop.terminal.name

        data.to = toTerminal
        if (toTerminalName) {
          data.toTerminalName = toTerminalName
        }
      }
    }

    // Always ensure terminal names are populated for search functionality
    // This handles both user-provided terminals and trip defaults
    if (!data.fromTerminalName && data.from) {
      try {
        const fromTerminalDoc = await req.payload.findByID({
          collection: 'terminals',
          id: data.from,
        })
        data.fromTerminalName = fromTerminalDoc.name
      } catch (error) {
        console.warn('populateFromAndTo: Could not fetch from terminal name', error)
      }
    }

    if (!data.toTerminalName && data.to) {
      try {
        const toTerminalDoc = await req.payload.findByID({
          collection: 'terminals',
          id: data.to,
        })
        data.toTerminalName = toTerminalDoc.name
      } catch (error) {
        console.warn('populateFromAndTo: Could not fetch to terminal name', error)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      // Determine if terminals were user-provided by checking if they were set before trip defaults
      const hasUserProvidedTerminals = Boolean(
        data.from &&
          tripSchedule.from &&
          data.from !==
            (typeof tripSchedule.from === 'string' ? tripSchedule.from : tripSchedule.from.id),
      )

      console.debug('populateFromAndTo: Successfully populated', {
        tripId: data.trip,
        from: data.from,
        fromName: data.fromTerminalName,
        to: data.to,
        toName: data.toTerminalName,
        hasUserTerminals: hasUserProvidedTerminals,
      })
    }
  } catch (error) {
    console.error('populateFromAndTo: Error populating from/to fields', error)
    // Don't throw - allow the operation to continue even if this fails
  }

  return data
}
