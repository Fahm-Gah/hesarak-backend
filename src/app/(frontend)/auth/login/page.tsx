import React from 'react'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utils/getMeUser'
import { LoginClient } from './page.client'

// Disable caching for this page to ensure auth checks are always fresh
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // Check if user is already logged in
  try {
    const result = await getMeUser()

    if (result?.user) {
      // User is already logged in, redirect based on role
      const hasAdminRoles =
        result.user.roles && result.user.roles.some((role) => role !== 'customer')
      redirect(hasAdminRoles ? '/admin' : '/')
    }
  } catch (error) {
    // Check if this is a redirect error (expected behavior)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors
    }
    // User is not authenticated, continue to login page
  }

  return <LoginClient />
}
