import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { getMeUser } from '@/utils/getMeUser'
import { getClientSideURL } from '@/utils/getURL'
import { TripDetailsClient } from './page.client'

export const dynamic = 'force-dynamic'

interface TripDetailsPageProps {
  params: Promise<{ tripId: string }>
  searchParams: Promise<{ date?: string }>
}

async function fetchTripDetails(tripId: string, date: string) {
  try {
    const response = await fetch(
      `${getClientSideURL()}/api/trips/${tripId}/date/${encodeURIComponent(date)}`,
      {
        cache: 'no-store',
      }
    )

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
  const { date } = await searchParams

  if (!date) {
    redirect('/search')
  }

  // Fetch trip details
  const tripDetails = await fetchTripDetails(tripId, date)

  if (!tripDetails) {
    notFound()
  }

  // Get user authentication status
  let user = null
  try {
    const result = await getMeUser()
    user = result?.user || null
  } catch (error) {
    // User is not authenticated, continue without user data
  }

  return (
    <TripDetailsClient 
      tripDetails={tripDetails} 
      user={user}
      isAuthenticated={!!user}
    />
  )
}