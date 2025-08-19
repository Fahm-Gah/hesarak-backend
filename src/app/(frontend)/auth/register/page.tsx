import React from 'react'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utils/getMeUser'
import { RegisterClient } from './page.client'

// Disable caching for this page to ensure auth checks are always fresh
export const dynamic = 'force-dynamic'

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectTo } = await searchParams

  // Check if user is already logged in
  try {
    const result = await getMeUser()

    if (result?.user) {
      // User is already logged in, redirect to the intended page or default
      if (redirectTo) {
        redirect(redirectTo)
      } else {
        const hasAdminRoles =
          result.user.roles && result.user.roles.some((role) => role !== 'customer')
        redirect(hasAdminRoles ? '/admin' : '/')
      }
    }
  } catch (error) {
    // Check if this is a redirect error (expected behavior)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error // Re-throw redirect errors
    }
    // User is not authenticated, continue to register page
  }

  return <RegisterClient />
}
