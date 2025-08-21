'use client'

import { useState, useCallback } from 'react'
import { validateLoginData, type LoginFormData } from '@/validations/auth'

interface UseLoginFormReturn {
  formData: LoginFormData
  errors: Record<string, string>
  handleInputChange: (field: keyof LoginFormData, value: string) => void
  validateForm: () => boolean
  isFormValid: boolean
}

export const useLoginForm = (
  onErrorClear?: () => void,
  onSuccessClear?: () => void,
): UseLoginFormReturn => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
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

  const validateForm = useCallback((): boolean => {
    const validation = validateLoginData(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return false
    }
    setErrors({})
    return true
  }, [formData])

  const isFormValid = Boolean(formData.email.trim() && formData.password.trim())

  return {
    formData,
    errors,
    handleInputChange,
    validateForm,
    isFormValid,
  }
}
