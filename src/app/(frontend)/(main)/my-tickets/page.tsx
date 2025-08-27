import React from 'react'
import { Metadata } from 'next'
import { TicketsPageClient } from './page.client'

export const metadata: Metadata = {
  title: 'My Tickets | Hesarakbus',
  description: 'View your booked bus tickets and travel history',
}

export default function TicketsPage() {
  return <TicketsPageClient />
}
