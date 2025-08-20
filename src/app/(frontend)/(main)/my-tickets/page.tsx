import React from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TicketsPageClient } from './page.client'
import { getMeUser } from '@/utils/getMeUser'
import { getServerSideURL } from '@/utils/getURL'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Tickets | Hesarakbus',
  description: 'View your booked bus tickets and travel history',
}

import { UserTicket, TicketsResponse } from './types'

// Server-side data fetching function
async function fetchUserTickets(token: string): Promise<UserTicket[]> {
  try {
    const response = await fetch(`${getServerSideURL()}/api/user/tickets`, {
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`)
    }

    const result: TicketsResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tickets')
    }

    return result.data?.tickets || []
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }
}

export default async function TicketsPage() {
  // Check authentication
  let user
  let token
  try {
    const authResult = await getMeUser()
    user = authResult.user
    token = authResult.token
  } catch (error) {
    // Redirect to login if not authenticated
    redirect('/auth/login?redirect=' + encodeURIComponent('/my-tickets'))
  }

  // Fetch tickets server-side
  const tickets = await fetchUserTickets(token)

  return <TicketsPageClient tickets={tickets} user={user} />
}
