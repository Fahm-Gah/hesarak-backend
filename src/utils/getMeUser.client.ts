import type { User } from '@/payload-types'

export interface FetchMeUserResult {
  user: User | null
  token?: string
}

export const getMeUser = async (): Promise<FetchMeUserResult> => {
  try {
    const response = await fetch('/api/users/me')
    
    if (!response.ok) {
      return { user: null }
    }
    
    const data = await response.json()
    return {
      user: data.user || null,
      token: data.token
    }
  } catch (error) {
    console.log('Failed to fetch user:', error)
    return { user: null }
  }
}