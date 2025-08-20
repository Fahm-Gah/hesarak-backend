'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthContext'
import { validateRegisterData, type RegisterFormData } from '@/validations/auth'
import { Logo } from '@/app/(frontend)/components/Logo'
import { getClientSideURL } from '@/utils/getURL'

export const RegisterClient = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    fatherName: '',
    gender: 'male',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const { register, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (error) clearError()
    if (success) setSuccess(false)
  }

  const validateForm = () => {
    const validation = validateRegisterData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }
    setErrors({})
    return validation.normalizedData
  }

  // Location permission handlers
  const requestLocationPermission = async () => {
    setIsRequestingLocation(true)

    try {
      // Try browser geolocation
      if (window.isSecureContext && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Geolocation timeout'))
          }, 10000) // 10 second timeout for registration

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
              timeout: 10000,
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
        throw new Error('Geolocation not available')
      }
    } catch (error) {
      console.log('Browser location failed, using IP fallback:', error)

      // Fallback to IP geolocation
      try {
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
      } catch (fallbackError) {
        console.error('IP location fallback failed:', fallbackError)
      }
    } finally {
      setIsRequestingLocation(false)
      proceedToRedirect()
    }
  }

  const skipLocation = async () => {
    // Use IP geolocation as fallback when user skips
    try {
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
    } catch (error) {
      console.error('IP location fallback failed:', error)
    }

    proceedToRedirect()
  }

  const proceedToRedirect = () => {
    // Use default redirect based on user role (will be determined after login)
    const defaultRedirect = '/'
    const finalRedirect = redirectTo !== '/' ? redirectTo : defaultRedirect

    setTimeout(() => {
      router.push(finalRedirect)
      router.refresh()
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = validateForm()
    if (!validationResult) {
      return
    }

    setSuccess(false)

    try {
      const result = await register({
        email: validationResult.email,
        phone: validationResult.phone,
        password: validationResult.password,
        fullName: validationResult.fullName,
        fatherName: validationResult.fatherName,
        gender: validationResult.gender as 'male' | 'female',
      })

      if (result.success && result.user) {
        // Registration successful - user is automatically logged in
        setSuccess(true)

        // Show location permission prompt after a brief success display
        setTimeout(() => {
          setShowLocationPrompt(true)
        }, 1500)
      }
      // Error handling is done in the AuthContext
    } catch (err) {
      console.error('Registration error:', err)
    }
  }

  // Close gender dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showGenderDropdown) {
        const target = event.target as Element
        const dropdown = document.querySelector('.gender-dropdown')

        if (dropdown && !dropdown.contains(target)) {
          setShowGenderDropdown(false)
        }
      }
    }

    if (showGenderDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showGenderDropdown])

  const genderOptions = [
    { value: 'male', label: 'Male', icon: '👨' },
    { value: 'female', label: 'Female', icon: '👩' },
  ]

  const selectedGender = genderOptions.find((option) => option.value === formData.gender)

  const isFormValid =
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    formData.fullName.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Logo */}
          <Logo
            variant="auth"
            size="lg"
            title="Create Account"
            subtitle="Join Hesarakbus to get started."
          />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && !showLocationPrompt && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-700 text-sm">
                  Registration successful! Setting up your account...
                </span>
              </div>
            </div>
          )}

          {/* Location Permission Prompt - Simple */}
          {showLocationPrompt && (
            <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg text-center">
              <svg
                className="w-12 h-12 text-orange-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">Allow location access?</h3>

              <p className="text-gray-600 mb-6">This helps us serve our customers better.</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={requestLocationPermission}
                  disabled={isRequestingLocation}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2"></div>
                      Getting...
                    </>
                  ) : (
                    'Allow'
                  )}
                </button>

                <button
                  onClick={skipLocation}
                  disabled={isRequestingLocation}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!showLocationPrompt && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
                    errors.fullName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading || success}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/80"
                  placeholder="Enter your father's name (optional)"
                  disabled={isLoading || success}
                />
              </div>

              {/* Gender */}
              <div className="gender-dropdown">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowGenderDropdown(!showGenderDropdown)
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 flex items-center justify-between ${
                      errors.gender
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    disabled={isLoading || success}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{selectedGender?.icon}</span>
                      <span className="text-gray-900">{selectedGender?.label}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        showGenderDropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showGenderDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                      {genderOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInputChange('gender', option.value as 'male' | 'female')
                            setShowGenderDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center ${
                            formData.gender === option.value
                              ? 'bg-orange-50 text-orange-700'
                              : 'text-gray-900'
                          }`}
                          disabled={isLoading || success}
                        >
                          <span className="text-xl mr-3">{option.icon}</span>
                          <span>{option.label}</span>
                          {formData.gender === option.value && (
                            <svg
                              className="w-5 h-5 ml-auto text-orange-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading || success}
                  autoComplete="email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="flex w-full">
                  {/* Country Code Selector (Fixed) */}
                  <div className="flex items-center px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-100 border-r-0 flex-shrink-0">
                    <span className="text-2xl mr-2">🇦🇫</span>
                    <span className="text-gray-700 font-medium">+93</span>
                  </div>
                  {/* Phone Number Input */}
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits and limit to 9 characters
                      let value = e.target.value.replace(/\D/g, '')
                      // Remove leading 0 if present
                      if (value.startsWith('0')) {
                        value = value.substring(1)
                      }
                      // Limit to 9 digits
                      value = value.substring(0, 9)
                      handleInputChange('phone', value)
                    }}
                    className={`flex-1 min-w-0 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
                      errors.phone
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="701234567"
                    maxLength={9}
                    required
                    disabled={isLoading || success}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter 9 digits without the leading 0</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="Enter your password (min 8 characters)"
                    required
                    disabled={isLoading || success}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading || success}
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading || success}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading || success}
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading || success}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 relative overflow-hidden mt-6"
              >
                <div className="relative z-10">
                  {success ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 mr-2">
                        <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            className="animate-[draw-circle_1s_ease-in-out_forwards]"
                            strokeDasharray="62.83"
                            strokeDashoffset="62.83"
                          />
                          <path
                            d="M8 12l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            className="animate-[draw-check_0.5s_ease-in-out_0.8s_forwards]"
                            strokeDasharray="10"
                            strokeDashoffset="10"
                          />
                        </svg>
                      </div>
                      <span>Registration Successful!</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </div>
                <style jsx>{`
                  @keyframes draw-circle {
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                  @keyframes draw-check {
                    to {
                      stroke-dashoffset: 0;
                    }
                  }
                `}</style>
              </button>
            </form>
          )}

          {/* Sign In Link */}
          {!showLocationPrompt && (
            <div className="text-center mt-8">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
