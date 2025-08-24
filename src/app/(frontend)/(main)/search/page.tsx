import React from 'react'
import { Metadata } from 'next'
import { SearchPageClient } from './page.client'
import { getClientSideURL } from '@/utils/getURL'
import { generateSEOMetadata } from '@/components/SEO/SEOHead'
import { ServiceStructuredData } from '@/components/SEO/StructuredData'
import moment from 'moment-jalaali'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
    date?: string
    page?: string
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
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
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
  page?: string,
): Promise<SearchResult | null> {
  try {
    const searchParamsObj = new URLSearchParams({
      from,
      to,
      date,
    })

    if (page) searchParamsObj.set('page', page)

    const response = await fetch(
      `${getClientSideURL()}/api/trips/search?${searchParamsObj.toString()}`,
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

// Fetch provinces for dropdowns
async function fetchProvinces(): Promise<string[]> {
  try {
    const response = await fetch(`${getClientSideURL()}/api/provinces`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (response.ok) {
      const data = await response.json()
      return data.data?.provinces || []
    }
  } catch (error) {
    console.error('Error fetching provinces:', error)
  }

  return []
}

// Get today's date in Jalaali format
function getTodayJalaaliDate(): string {
  const today = moment()
  return today.format('jYYYY-jMM-jDD')
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const { from, to, page } = params

  // Use today's date if date is not provided
  const date = params.date || getTodayJalaaliDate()

  // Fetch provinces for dropdowns (always fetch on server)
  const provinces = await fetchProvinces()

  // If missing from or to, show the search prompt page
  if (!from || !to) {
    return (
      <SearchPageClient
        searchParams={{ from: from || '', to: to || '', date, page }}
        provinces={provinces}
      />
    )
  }

  // Fetch search results on the server
  const searchResult = await fetchSearchResults(from, to, date, page)

  return (
    <SearchPageClient
      searchResult={searchResult || undefined}
      searchParams={{ from, to, date, page }}
      provinces={provinces}
    />
  )
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { from, to, date } = await searchParams

  if (!from || !to) {
    return generateSEOMetadata({
      title: 'جستجوی سفر | حصارک‌بس - رزرو بلیط اتوبوس',
      description:
        'جستجو و رزرو آسان بلیط اتوبوس بین شهرهای افغانستان. انتخاب صندلی، مقایسه قیمت و پرداخت آنلاین امن.',
      keywords:
        'جستجو سفر, رزرو بلیط, اتوبوس افغانستان, بلیط آنلاین, حصارک‌بس, سفر بین شهری, پنجشیر',
      url: '/search',
      type: 'service',
    })
  }

  const formattedDate = date
    ? moment(date, 'jYYYY-jMM-jDD').format('jDD jMMMM jYYYY')
    : 'تاریخ انتخابی شما'

  return generateSEOMetadata({
    title: `${from} به ${to} - ${formattedDate} | حصارک‌بس`,
    description: `بلیط اتوبوس از ${from} به ${to} در تاریخ ${formattedDate}. مقایسه قیمت، انتخاب صندلی و رزرو آنلاین با حصارک‌بس.`,
    keywords: `${from}, ${to}, بلیط اتوبوس, رزرو آنلاین, ${formattedDate}, حصارک‌بس, سفر, حمل و نقل`,
    url: `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
    type: 'service',
  })
}
