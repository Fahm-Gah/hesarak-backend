import React from 'react'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { getMeUser } from '@/utils/getMeUser'
import { NavBarClient } from './index.client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const NavBar = async () => {
  // Prevent caching
  noStore()

  // Force this component to be dynamic by accessing cookies
  await cookies()

  let user = null

  try {
    const result = await getMeUser()
    user = result?.user
  } catch (error) {
    // User is not authenticated
    console.log(error)
  }

  return <NavBarClient user={user} />
}
