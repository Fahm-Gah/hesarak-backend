'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthContext'
import { Logo } from '@/app/(frontend)/components/Logo'
import { EmailPhoneInput } from './components/EmailPhoneInput'
import { PasswordInput } from '../register/components/PasswordInput'
import { LocationPermissionPrompt } from '../register/components/LocationPermissionPrompt'
import { Alert } from '../register/components/Alert'
import { LoginSubmitButton } from './components/LoginSubmitButton'
import { useLocationPermission } from '@/hooks'
import { useLoginForm } from './hooks/useLoginForm'

export const LoginClient = () => {
  const [success, setSuccess] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const { login, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const { formData, errors, handleInputChange, validateForm, isFormValid } = useLoginForm(
    clearError,
    () => setSuccess(false),
  )

  const { shouldShowLocationPrompt, isCheckingPermission, permissionState } =
    useLocationPermission()

  // Location permission handlers
  const handleLocationGranted = () => {
    proceedToRedirect()
  }

  const handleLocationSkipped = () => {
    proceedToRedirect()
  }

  const proceedToRedirect = () => {
    const hasAdminRoles =
      // We'll get this from the login result, but for now use a default
      false // This will be updated in handleSubmit
    const defaultRedirect = hasAdminRoles ? '/admin' : '/'
    const finalRedirect = redirectTo !== '/' ? redirectTo : defaultRedirect

    setTimeout(() => {
      router.push(finalRedirect)
      router.refresh()
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form first
    if (!validateForm()) {
      return
    }

    setSuccess(false)

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      })

      if (result.success && result.user) {
        // Login successful - show success message
        setSuccess(true)

        // Check if we should show location prompt
        if (shouldShowLocationPrompt && !isCheckingPermission) {
          // Show location permission prompt after a brief success display
          setTimeout(() => {
            setShowLocationPrompt(true)
          }, 1500)
        } else {
          // No location prompt needed, redirect directly
          const hasAdminRoles =
            result.user.roles && result.user.roles.some((role: string) => role !== 'customer')
          const defaultRedirect = hasAdminRoles ? '/admin' : '/'
          const finalRedirect = redirectTo !== '/' ? redirectTo : defaultRedirect

          setTimeout(() => {
            router.push(finalRedirect)
            router.refresh()
          }, 1500)
        }
      }
      // Error handling is done in the AuthContext
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Logo */}
          <Logo
            variant="auth"
            size="lg"
            title="Welcome back"
            subtitle="Please sign in to your account."
          />

          {/* Error Message */}
          {error && <Alert type="error" message={error} />}

          {/* Success Message */}
          {success && !showLocationPrompt && (
            <Alert type="success" message="Login successful! Setting up your session..." />
          )}

          {/* Location Permission Prompt */}
          {showLocationPrompt && (
            <LocationPermissionPrompt
              onLocationGranted={handleLocationGranted}
              onLocationSkipped={handleLocationSkipped}
            />
          )}

          {/* Login Form */}
          {!showLocationPrompt && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Field */}
              <EmailPhoneInput
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                disabled={isLoading || success}
                error={errors.email}
                autoComplete="username"
              />

              {/* Password Field */}
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                disabled={isLoading || success}
                error={errors.password}
                autoComplete="current-password"
              />

              {/* Submit Button */}
              <LoginSubmitButton
                isLoading={isLoading}
                isSuccess={success}
                disabled={!isFormValid || isLoading || success}
              />
            </form>
          )}

          {/* Divider */}
          {!showLocationPrompt && (
            <>
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-4 text-sm text-gray-500">or</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    href={`/auth/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Footer */}
          {!showLocationPrompt && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                  Contact Support
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
