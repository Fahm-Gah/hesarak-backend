import React from 'react'
import { Metadata } from 'next'
import { SearchPageClient } from './page.client'

export const metadata: Metadata = {
  title: 'Search Trips | Hesarak',
  description: 'Search for bus trips between cities',
}

export default function SearchPage() {
  return <SearchPageClient />
}
