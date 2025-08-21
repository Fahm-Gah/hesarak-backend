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
async function fetchUserTickets(
  token: string,
  page?: number,
  filters?: {
    search?: string
    status?: string
    fromDate?: string
    toDate?: string
    fromLocation?: string
    toLocation?: string
    filter?: string
  },
): Promise<{ tickets: UserTicket[]; pagination?: any }> {
  try {
    const searchParams = new URLSearchParams()
    if (page) searchParams.set('page', page.toString())
    if (filters?.search) searchParams.set('search', filters.search)
    if (filters?.status) searchParams.set('status', filters.status)
    if (filters?.fromDate) searchParams.set('fromDate', filters.fromDate)
    if (filters?.toDate) searchParams.set('toDate', filters.toDate)
    if (filters?.fromLocation) searchParams.set('fromLocation', filters.fromLocation)
    if (filters?.toLocation) searchParams.set('toLocation', filters.toLocation)
    if (filters?.filter && filters.filter !== 'all') searchParams.set('filter', filters.filter)

    const queryString = searchParams.toString()
    const url = `${getServerSideURL()}/api/user/tickets${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
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

    return {
      tickets: result.data?.tickets || [],
      pagination:
        result.data?.page !== undefined
          ? {
              currentPage: result.data.page,
              totalCount: result.data.total,
              totalPages: result.data.totalPages || Math.ceil((result.data.total || 0) / 10),
              hasMore: result.data.hasMore,
            }
          : undefined,
    }
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return { tickets: [] }
  }
}

interface TicketsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    fromDate?: string
    toDate?: string
    fromLocation?: string
    toLocation?: string
    filter?: string
  }>
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
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

  // Get pagination and filter params
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1

  // Extract filter parameters
  const filters = {
    search: params.search,
    status: params.status,
    fromDate: params.fromDate,
    toDate: params.toDate,
    fromLocation: params.fromLocation,
    toLocation: params.toLocation,
    filter: params.filter || 'all',
  }

  // Fetch tickets server-side with pagination and filters
  const { tickets, pagination } = await fetchUserTickets(token, page, filters)

  return <TicketsPageClient tickets={tickets} user={user} pagination={pagination} />
}
