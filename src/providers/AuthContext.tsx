'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSideURL } from '@/utils/getURL'
import { normalizePhoneNumber } from '@/validations/auth'

interface User {
  id: string
  email: string
  username?: string
  normalizedPhone?: string
  roles: string[]
  profile?: {
    id: string
    fullName: string
    fatherName?: string
    phoneNumber: string
    gender: 'male' | 'female'
  }
  isActive: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  phone: string
  password: string
  fullName: string
  fatherName?: string
  gender: 'male' | 'female'
}

interface AuthContextType extends AuthState {
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; user?: User; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  })
  const _router = useRouter()

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${getClientSideURL()}/api/users/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState((prev) => ({ ...prev, user: data.user, error: null }))
      } else {
        setAuthState((prev) => ({ ...prev, user: null }))
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
      setAuthState((prev) => ({ ...prev, user: null }))
    }
  }, [])

  // Helper function to capture location silently in background
  const captureLocationSilently = useCallback(async () => {
    try {
      // Try browser geolocation first with timeout
      if (window.isSecureContext && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Geolocation timeout'))
          }, 5000) // 5 second timeout for login

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeout)
              resolve(pos)
            },
            (err) => {
              clearTimeout(timeout)
              reject(err)
            },
            {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 300000, // 5 minutes
            },
          )
        })

        // Send precise location to server
        await fetch(`${getClientSideURL()}/api/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        })
      } else {
        // Fallback to IP geolocation
        await fetch(`${getClientSideURL()}/api/update-location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            useFallback: true,
          }),
        })
      }
    } catch (error) {
      // Silent failure - location capture shouldn't interfere with login
      console.log('Background location capture failed:', error)
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // Normalize phone number if it looks like a phone number
        const emailOrPhone = credentials.email.trim()
        let loginIdentifier = emailOrPhone

        // Check if it's a phone number (contains only digits and some special chars)
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/
        if (phoneRegex.test(emailOrPhone)) {
          loginIdentifier = normalizePhoneNumber(emailOrPhone)
        }

        const response = await fetch(`${getClientSideURL()}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: loginIdentifier,
            password: credentials.password,
          }),
        })

        const data = await response.json()

        if (response.ok && data.user) {
          setAuthState((prev) => ({
            ...prev,
            user: data.user,
            isLoading: false,
            error: null,
          }))

          // Capture location in background after successful login
          setTimeout(() => {
            captureLocationSilently()
          }, 100)

          return { success: true, user: data.user }
        } else {
          const errorMessage =
            data.errors?.[0]?.message ||
            data.message ||
            'Login failed. Please check your credentials.'

          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }))

          return { success: false, error: errorMessage }
        }
      } catch (error) {
        console.error('Login error:', error)
        const errorMessage = 'Network error. Please try again.'

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))

        return { success: false, error: errorMessage }
      }
    },
    [captureLocationSilently],
  )

  const register = useCallback(async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`${getClientSideURL()}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email.trim(),
          phone: normalizePhoneNumber(data.phone.trim()),
          password: data.password,
          fullName: data.fullName.trim(),
          fatherName: data.fatherName?.trim() || undefined,
          gender: data.gender,
        }),
      })

      const responseData = await response.json()

      if (response.ok && responseData.user) {
        // Registration successful - now login the user
        try {
          // Login the user but skip automatic location capture for registration
          const response = await fetch(`${getClientSideURL()}/api/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          })

          const loginData = await response.json()

          if (response.ok && loginData.user) {
            setAuthState((prev) => ({
              ...prev,
              user: loginData.user,
              isLoading: false,
              error: null,
            }))

            // Don't capture location automatically - registration flow will handle it
            return { success: true, user: loginData.user }
          } else {
            const loginErrorMessage =
              loginData.errors?.[0]?.message ||
              loginData.message ||
              'Registration successful, but auto-login failed. Please login manually.'

            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              error: loginErrorMessage,
            }))

            return {
              success: false,
              error: loginErrorMessage,
            }
          }
        } catch (loginError) {
          console.error('Auto-login after registration failed:', loginError)
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Registration successful, but auto-login failed. Please login manually.',
          }))

          return {
            success: false,
            error: 'Registration successful, but auto-login failed. Please login manually.',
          }
        }
      } else {
        const errorMessage =
          responseData.error || responseData.message || 'Registration failed. Please try again.'

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }))

        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = 'Network error. Please try again.'

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))

      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`${getClientSideURL()}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      // Clear user state regardless of response (in case server is down)
      setAuthState((prev) => ({
        ...prev,
        user: null,
        isLoading: false,
        error: null,
      }))

      if (response.ok) {
        return { success: true }
      } else {
        // Still return success since we cleared local state
        return { success: true }
      }
    } catch (error) {
      console.error('Logout error:', error)

      // Clear user state even if network fails
      setAuthState((prev) => ({
        ...prev,
        user: null,
        isLoading: false,
        error: null,
      }))

      return { success: true }
    }
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
