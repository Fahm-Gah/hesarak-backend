import React from 'react'
import { Metadata } from 'next'
import { SearchPageClient } from './page.client'
import { getServerSideURL } from '@/utils/getURL'
import moment from 'moment-jalaali'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    date?: string
  }>
}

interface SearchResult {
  success: boolean
  data?: {
    searchParams: {
      fromProvince: string
      toProvince: string
      originalDate: string
      convertedDate: string
    }
    trips: any[]
    summary: {
      totalTrips: number
      availableTrips: number
      fullyBookedTrips: number
    }
  }
  error?: string
}

// Server-side data fetching function
async function fetchSearchResults(
  from: string,
  to: string,
  date: string,
): Promise<SearchResult | null> {
  try {
    const searchParamsObj = new URLSearchParams({
      from,
      to,
      date,
    })

    const response = await fetch(
      `${getServerSideURL()}/api/trips/search?${searchParamsObj.toString()}`,
      {
        cache: 'no-store', // Always fetch fresh data for search results
      },
    )

    if (!response.ok) {
      console.error(`Search API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching search results:', error)
    return null
  }
}

// Get today's date in Jalaali format
function getTodayJalaaliDate(): string {
  const today = moment()
  return today.format('jYYYY-jMM-jDD')
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const { from, to } = params

  // Use today's date if date is not provided
  const date = params.date || getTodayJalaaliDate()

  // If missing from or to, show the search prompt page
  if (!from || !to) {
    return <SearchPageClient searchParams={{ from: from || '', to: to || '', date }} />
  }

  // Fetch search results on the server
  const searchResult = await fetchSearchResults(from, to, date)

  return (
    <SearchPageClient searchResult={searchResult || undefined} searchParams={{ from, to, date }} />
  )
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { from, to, date } = await searchParams

  if (!from || !to) {
    return {
      title: 'Search Trips | Hesarak',
      description: 'Search for bus trips between cities',
    }
  }

  return {
    title: `${from} to ${to} - Search Results | Hesarak`,
    description: `Find bus trips from ${from} to ${to} on ${date || 'your selected date'}`,
  }
}
