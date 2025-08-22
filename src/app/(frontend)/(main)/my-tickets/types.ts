export interface UserTicket {
  id: string
  ticketNumber: string
  trip: {
    id: string
    name: string
    from: {
      name: string
      province: string
      address: string
    }
    to: {
      name: string
      province: string
      address: string
    } | null
    departureTime: string
    arrivalTime: string | null
    duration: string | null
    bus: {
      number: string
      type: {
        name: string
        amenities?: string[] | null
      }
    }
  }
  booking: {
    date: string
    seats: Array<{
      id: string
      seatNumber: string
    }>
    totalPrice: number
    pricePerSeat: number
  }
  status: {
    isPaid?: boolean
    isCancelled?: boolean
    paymentDeadline?: string
    isExpired?: boolean
  }
  bookedAt: string
}

export interface TicketsResponse {
  success: boolean
  data?: {
    tickets: UserTicket[]
    total: number
    page?: number
    totalPages?: number
    hasMore?: boolean
  }
  error?: string
}
