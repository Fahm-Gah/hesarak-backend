'use client'

import { useState, useCallback } from 'react'
import { validateRegisterData, type RegisterFormData } from '@/validations/auth'

interface ValidatedData {
  email: string
  phone: string
  fullName: string
  fatherName: string
  gender: string
  password: string
}

interface UseRegisterFormReturn {
  formData: RegisterFormData
  errors: Record<string, string>
  handleInputChange: (field: keyof RegisterFormData, value: string) => void
  validateForm: () => ValidatedData | false
  isFormValid: boolean
}

export const useRegisterForm = (
  onErrorClear?: () => void,
  onSuccessClear?: () => void,
): UseRegisterFormReturn => {
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

  const handleInputChange = useCallback(
    (field: keyof RegisterFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }))
      }

      // Call external callbacks
      onErrorClear?.()
      onSuccessClear?.()
    },
    [errors, onErrorClear, onSuccessClear],
  )

  const validateForm = useCallback((): ValidatedData | false => {
    const validation = validateRegisterData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }
    setErrors({})
    return validation.normalizedData
  }, [formData])

  const isFormValid = Boolean(
    formData.email.trim() &&
      formData.phone.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.fullName.trim(),
  )

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    isFormValid,
  }
}