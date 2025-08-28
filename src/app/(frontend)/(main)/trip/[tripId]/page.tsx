import React from 'react'
import { redirect } from 'next/navigation'
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

export default async function TripDetailsPage({ params, searchParams }: TripDetailsPageProps) {
  const { tripId } = await params
  const { date, error, from, to, fromProvince, toProvince } = await searchParams

  if (!date) {
    redirect('/search')
  }

  return (
    <TripDetailsClient
      tripId={tripId}
      date={date}
      from={from}
      to={to}
      initialError={error}
      originalSearchParams={{
        fromProvince,
        toProvince,
        date,
      }}
    />
  )
}
