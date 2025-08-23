'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthContext'
import { getClientSideURL } from '@/utils/getURL'
import { validateProfileData, type ProfileUpdateData } from '@/validations/auth'
import { Breadcrumbs } from '@/app/(frontend)/components/Breadcrumbs'

interface User {
  id: string
  email?: string | null
  username?: string
  normalizedPhone?: string | null
  roles: string[]
  profile?:
    | string
    | {
        id: string
        fullName: string
        fatherName?: string | null
        phoneNumber?: string | null
        gender?: 'male' | 'female' | null
      }
    | null
  isActive?: boolean | null
}

interface ProfileClientProps {
  user: User
}

export const ProfileClient = ({ user: initialUser }: ProfileClientProps) => {
  const { user, refreshUser } = useAuth()
  const currentUser = user || initialUser

  // Type guard to check if profile is a populated object
  const getProfile = (profile: typeof currentUser.profile) => {
    if (profile && typeof profile === 'object' && 'id' in profile) {
      return profile
    }
    return null
  }

  const userProfile = getProfile(currentUser.profile)

  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)

  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullName: userProfile?.fullName || '',
    fatherName: userProfile?.fatherName || '',
    gender: userProfile?.gender || 'male',
  })

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = () => {
    const validation = validateProfileData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }
    setErrors({})
    return validation.normalizedData
  }

  const handleSave = useCallback(async () => {
    const validationResult = validateForm()
    if (!validationResult) {
      return
    }

    if (!userProfile?.id) {
      setError('پروفایل پیدا نشد. لطفاً با پشتیبانی تماس بگیرید.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${getClientSideURL()}/api/profiles/${userProfile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: validationResult.fullName,
          fatherName: validationResult.fatherName || undefined,
          gender: validationResult.gender,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('پروفایل با موفقیت به‌روزرسانی شد!')
        setIsEditing(false)
        setShowGenderDropdown(false)
        // Refresh user data
        await refreshUser()
      } else {
        setError(data.errors?.[0]?.message || data.message || 'به‌روزرسانی پروفایل ناموفق بود')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError('خطای شبکه. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, userProfile?.id, refreshUser])

  const handleCancel = () => {
    setFormData({
      fullName: userProfile?.fullName || '',
      fatherName: userProfile?.fatherName || '',
      gender: userProfile?.gender || 'male',
    })
    setIsEditing(false)
    setError(null)
    setSuccess(null)
    setErrors({})
    setShowGenderDropdown(false)
  }

  const formatPhoneForDisplay = (phone: string) => {
    // Remove +93 and format as 0XXXXXXXXX for display
    if (phone.startsWith('+93')) {
      return `0${phone.substring(3)}`
    }
    return phone
  }

  const handleGenderSelect = (gender: 'male' | 'female') => {
    handleInputChange('gender', gender)
    setShowGenderDropdown(false)
  }

  const getGenderDisplayText = (gender: 'male' | 'female') => {
    return gender === 'male' ? 'مرد' : 'زن'
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setShowGenderDropdown(false)
    }

    if (showGenderDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showGenderDropdown])

  const breadcrumbItems = [{ label: 'صفحه اصلی', href: '/' }, { label: 'پروفایل' }]

  // If user doesn't have a profile, show error message
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">پروفایل پیدا نشد</h2>
              <p className="text-gray-600 mb-6">
                حساب کاربری شما پروفایل مرتبط ندارد. لطفاً برای حل این مسئله با پشتیبانی تماس
                بگیرید.
              </p>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200"
              >
                برو به صفحه اصلی
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                تنظیمات پروفایل
              </h1>
              <p className="text-gray-600 mt-2">اطلاعات حساب کاربری خود را مدیریت کنید</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 ml-2"
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
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 ml-2"
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

        {/* Main Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Notice */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-orange-600 ml-3 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-orange-800">امنیت حساب</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    برای تغییر ایمیل یا شماره تلفن خود، لطفاً با پشتیبانی تماس بگیرید.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-3 border-b border-gray-200">
                جزئیات حساب
              </h3>
              <div>
                <div className="py-3">
                  <span className="text-gray-900">{currentUser.email || 'ارائه نشده'}</span>
                </div>
                <div className="py-3">
                  <span className="text-gray-900" dir="ltr">
                    {userProfile?.phoneNumber ? userProfile.phoneNumber : 'ارائه نشده'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">اطلاعات شخصی</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    ویرایش پروفایل
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50"
                    >
                      لغو
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          در حال ذخیره...
                        </div>
                      ) : (
                        'ذخیره تغییرات'
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام کامل</label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                          errors.fullName
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                        }`}
                        placeholder="نام کامل خود را وارد کنید"
                        disabled={isLoading}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                      {userProfile?.fullName || 'ارائه نشده'}
                    </p>
                  )}
                </div>

                {/* Father Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نام پدر</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      placeholder="نام پدر خود را وارد کنید (اختیاری)"
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                      {userProfile?.fatherName || 'ارائه نشده'}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">جنسیت</label>
                  {isEditing ? (
                    <>
                      <div className="relative">
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isLoading) {
                              setShowGenderDropdown(!showGenderDropdown)
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between ${
                            errors.gender
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 hover:border-gray-400 focus:ring-orange-500 focus:border-orange-500'
                          } ${
                            isLoading
                              ? 'bg-gray-50 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-gray-900">
                            {getGenderDisplayText(formData.gender)}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
                        </div>

                        {showGenderDropdown && !isLoading && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGenderSelect('male')
                              }}
                              className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 first:rounded-t-lg border-b border-gray-100"
                            >
                              مرد
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGenderSelect('female')
                              }}
                              className="px-4 py-3 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-colors duration-150 last:rounded-b-lg"
                            >
                              زن
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg capitalize">
                      {userProfile?.gender === 'male'
                        ? 'مرد'
                        : userProfile?.gender === 'female'
                          ? 'زن'
                          : 'ارائه نشده'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
