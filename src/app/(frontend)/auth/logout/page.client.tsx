'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSideURL } from '@/utils/getURL'

export const LogoutClient = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      setIsLoggingOut(true)
      setError(null)

      try {
        const response = await fetch(`${getClientSideURL()}/api/users/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok || response.status === 401) {
          // Logout successful, show success state
          // Note: 401 status sometimes occurs after successful logout when token is already invalidated
          setIsLoggingOut(false)
          setIsSuccess(true)

          // Redirect to home page after showing success message
          setTimeout(() => {
            router.push('/')
            router.refresh() // Refresh to update auth state
          }, 2000)
        } else {
          // Only show error for actual server errors (5xx) or client errors other than 401
          try {
            const errorData = await response.json()
            setError(errorData.message || 'Logout failed. Please try again.')
          } catch {
            setError('Logout failed. Please try again.')
          }
          setIsLoggingOut(false)
        }
      } catch (err) {
        console.error('Logout error:', err)
        setError('Network error. Please try again.')
        setIsLoggingOut(false)
      }
    }

    performLogout()
  }, [router])

  const handleRetry = () => {
    setError(null)
    setIsLoggingOut(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Hesaarak
            </h1>
          </div>

          {isLoggingOut ? (
            <>
              {/* Loading State */}
              <div className="mb-6">
                <div className="mx-auto w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging you out...</h2>
              <p className="text-gray-600">
                Please wait while we securely log you out of your account.
              </p>
            </>
          ) : error ? (
            <>
              {/* Error State */}
              <div className="mb-6">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Logout Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Go to Home
                </button>
              </div>
            </>
          ) : isSuccess ? (
            <>
              {/* Success State */}
              <div className="mb-6">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Successfully Logged Out</h2>
              <p className="text-gray-600 mb-6">
                You have been securely logged out. Redirecting to home page...
              </p>
            </>
          ) : null}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <a href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
