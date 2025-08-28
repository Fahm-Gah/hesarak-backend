import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { getMeUser } from '@/utils/getMeUser'
import { getServerSideURL } from '@/utils/getURL'
import { TripDetailsClient } from './page.client'

export const dynamic = 'force-dynamic'

interface TripDetailsPageProps {
  params: Promise<{ tripId: string }>
  searchParams: Promise<{
    date?: string
    error?: string
    from?: string // User's boarding terminal ID
    to?: string // User's destination terminal ID
    fromProvince?: string // User's original search province
    toProvince?: string // User's original search province
  }>
}

async function fetchTripDetails(
  tripId: string,
  date: string,
  from?: string,
  to?: string,
  token?: string,
) {
  try {
    const headers: HeadersInit = {}
    if (token) {
      headers.Authorization = `JWT ${token}`
    }

    // Build URL with optional from/to parameters
    let url = `${getServerSideURL()}/api/trips/${tripId}/date/${encodeURIComponent(date)}`
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers,
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.success ? result.data : null
  } catch (error) {
    console.error('Error fetching trip details:', error)
    return null
  }
}

export default async function TripDetailsPage({ params, searchParams }: TripDetailsPageProps) {
  const { tripId } = await params
  const { date, error, from, to, fromProvince, toProvince } = await searchParams

  if (!date) {
    redirect('/search')
  }

  // Get user authentication status and token
  let user = null
  let token = null
  try {
    const result = await getMeUser()
    user = result?.user || null
    token = result?.token || null
  } catch (error) {
    // User is not authenticated, continue without user data
  }

  // Fetch trip details with user-specific from/to if provided
  const tripDetails = await fetchTripDetails(tripId, date, from, to, token || undefined)

  if (!tripDetails) {
    notFound()
  }

  return (
    <TripDetailsClient
      tripDetails={tripDetails}
      user={user}
      isAuthenticated={!!user}
      initialError={error}
      originalSearchParams={{
        fromProvince,
        toProvince,
        date,
      }}
    />
  )
}
