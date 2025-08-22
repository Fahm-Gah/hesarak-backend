export interface BookingData {
  ticketId: string
  ticketNumber: string
  passenger: {
    id: string
    fullName: string
    fatherName?: string
    phoneNumber?: string
    gender?: string
  }
  trip: {
    id: string
    name: string
    price: number
    from?: {
      id: string
      name: string
      province: string
      address?: string
    }
    to?: {
      id: string
      name: string
      province: string
      address?: string
    }
    bus?: {
      id: string
      number: string
      images?: Array<{
        id: string
        url: string
        filename: string
        alt: string
        width: number
        height: number
      }>
      type?: {
        id: string
        name: string
        capacity: number
        amenities?: Array<{
          amenity: string
          id: string
        }>
      }
    }
  }
  booking: {
    date: string
    originalDate: string
    seats: Array<{
      id: string
      seatNumber: string
    }>
    totalPrice: number
    pricePerSeat: number
  }
  status: {
    isPaid: boolean
    isCancelled?: boolean
    paymentMethod?: string
    paymentDeadline?: string
    isExpired?: boolean
  }
}
