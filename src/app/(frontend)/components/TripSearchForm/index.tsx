import React from 'react'
import { TripSearchFormClient } from './index.client'
import { getClientSideURL } from '@/utils/getURL'

interface Province {
  success: boolean
  data: {
    provinces: string[]
    count: number
  }
}

export const TripSearchForm = async () => {
  let provinces: string[] = []

  try {
    const response = await fetch(`${getClientSideURL()}/api/provinces`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (response.ok) {
      const data: Province = await response.json()
      provinces = data.data?.provinces || []
    }
  } catch (error) {
    console.error('Error fetching provinces:', error)
  }

  return <TripSearchFormClient provinces={provinces} />
}
