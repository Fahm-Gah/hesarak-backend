import React from 'react'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utils/getMeUser'
import { ProfileClient } from './page.client'

// Disable caching for this page to ensure auth checks are always fresh
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  // Check if user is logged in - redirect to login if not
  try {
    const result = await getMeUser()

    if (!result?.user) {
      redirect('/auth/login?redirect=/profile')
    }

    // Pass user data to client component
    return <ProfileClient user={result.user} />
  } catch (error) {
    // User is not authenticated, redirect to login
    redirect('/auth/login?redirect=/profile')
  }
}
