export const validateTripDate = async (value: any, { data, req }: any) => {
  if (!value || !data?.trip) return true

  const { payload } = req

  try {
    // Fetch the trip schedule
    const trip = await payload.findByID({
      collection: 'trip-schedules',
      id: data.trip as string,
    })

    if (!trip || !(trip as any).isActive) {
      return 'Selected trip is not active'
    }

    const selectedDate = new Date(value)

    // Check if trip runs on this day
    if ((trip as any).frequency === 'specific-days' && (trip as any).days) {
      const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][selectedDate.getDay()]

      if (!(trip as any).days.includes(dayOfWeek)) {
        const dayNames = {
          sun: 'Sunday',
          mon: 'Monday',
          tue: 'Tuesday',
          wed: 'Wednesday',
          thu: 'Thursday',
          fri: 'Friday',
          sat: 'Saturday',
        }

        const runningDays = (trip as any).days
          .map((d: string) => dayNames[d as keyof typeof dayNames])
          .join(', ')
        return `This trip only runs on: ${runningDays}`
      }
    }

    return true
  } catch (error) {
    return 'Error validating trip date'
  }
}
