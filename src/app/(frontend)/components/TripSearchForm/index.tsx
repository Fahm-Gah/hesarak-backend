import React from 'react'
import { TripSearchFormClient } from './index.client'
import { getServerSideURL } from '@/utils/getURL'

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
    const response = await fetch(`${getServerSideURL()}/api/provinces`, {
      cache: 'no-store',
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
