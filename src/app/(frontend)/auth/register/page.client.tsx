'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthContext'
import { Logo } from '@/app/(frontend)/components/Logo'
import { FormInput } from './components/FormInput'
import { PhoneInput } from './components/PhoneInput'
import { PasswordInput } from '../components/PasswordInput'
import { GenderSelect } from './components/GenderSelect'
import { LocationPermissionPrompt } from '../components/LocationPermissionPrompt'
import { Alert } from '../components/Alert'
import { SubmitButton } from './components/SubmitButton'
import { useRegisterForm } from './hooks/useRegisterForm'

export const RegisterClient = () => {
  const [success, setSuccess] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const { register, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const { formData, errors, handleInputChange, validateForm, isFormValid } = useRegisterForm(
    clearError,
    () => setSuccess(false),
  )

  // Location permission handlers
  const handleLocationGranted = () => {
    proceedToRedirect()
  }

  const handleLocationSkipped = () => {
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

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Logo */}
          <Logo
            variant="auth"
            size="lg"
            title="ایجاد حساب"
            subtitle="به حصارک‌بس بپیوندید و شروع کنید."
          />

          {/* Error Message */}
          {error && <Alert type="error" message={error} />}

          {/* Success Message */}
          {success && !showLocationPrompt && (
            <Alert type="success" message="ثبت‌نام موفق! در حال تنظیم حساب شما..." />
          )}

          {/* Location Permission Prompt */}
          {showLocationPrompt && (
            <LocationPermissionPrompt
              onLocationGranted={handleLocationGranted}
              onLocationSkipped={handleLocationSkipped}
            />
          )}

          {/* Registration Form */}
          {!showLocationPrompt && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <FormInput
                label="نام کامل"
                value={formData.fullName}
                onChange={(value) => handleInputChange('fullName', value)}
                placeholder="نام کامل خود را وارد کنید"
                required
                disabled={isLoading || success}
                error={errors.fullName}
              />

              {/* Father Name */}
              <FormInput
                label="نام پدر"
                value={formData.fatherName || ''}
                onChange={(value) => handleInputChange('fatherName', value)}
                placeholder="نام پدر خود را وارد کنید (اختیاری)"
                disabled={isLoading || success}
              />

              {/* Gender */}
              <GenderSelect
                value={formData.gender}
                onChange={(value) => handleInputChange('gender', value)}
                disabled={isLoading || success}
                error={errors.gender}
              />

              {/* Email */}
              <FormInput
                label="ایمیل"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                placeholder="آدرس ایمیل خود را وارد کنید"
                required
                disabled={isLoading || success}
                error={errors.email}
                autoComplete="email"
              />

              {/* Phone */}
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                disabled={isLoading || success}
                error={errors.phone}
              />

              {/* Password */}
              <PasswordInput
                label="رمز عبور"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="رمز عبور خود را وارد کنید (حداقل ۸ کاراکتر)"
                disabled={isLoading || success}
                error={errors.password}
                autoComplete="new-password"
              />

              {/* Confirm Password */}
              <PasswordInput
                label="تأیید رمز عبور"
                value={formData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                placeholder="رمز عبور خود را تأیید کنید"
                disabled={isLoading || success}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <SubmitButton
                isLoading={isLoading}
                isSuccess={success}
                disabled={!isFormValid || isLoading || success}
              />
            </form>
          )}

          {/* Sign In Link */}
          {!showLocationPrompt && (
            <div className="text-center mt-8">
              <p className="text-gray-600">
                قبلاً حساب دارید؟{' '}
                <Link
                  href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  اینجا وارد شوید
                </Link>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              به کمک نیاز دارید؟{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                تماس با پشتیبانی
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
