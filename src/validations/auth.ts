// Phone number normalization function
export const normalizePhoneNumber = (phone: string): string => {
  // Remove all spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // If starts with +93, return as is
  if (cleaned.startsWith('+93')) {
    return cleaned
  }

  // If starts with 93, add +
  if (cleaned.startsWith('93')) {
    return `+${cleaned}`
  }

  // If starts with 0, replace with +93
  if (cleaned.startsWith('0')) {
    return `+93${cleaned.substring(1)}`
  }

  // If it's 9 digits, assume it's Afghan number without country code
  if (cleaned.length === 9 && /^[0-9]{9}$/.test(cleaned)) {
    return `+93${cleaned}`
  }

  // Default: add +93 prefix
  return `+93${cleaned}`
}

// Phone validation function
export const validatePhone = (
  phone: string,
): { isValid: boolean; error?: string; normalizedPhone?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' }
  }

  let normalizedPhone: string

  // If it's just 9 digits (from the register form), add +93
  if (/^[0-9]{9}$/.test(phone)) {
    normalizedPhone = `+93${phone}`
  } else {
    normalizedPhone = normalizePhoneNumber(phone)
  }

  // Check if it's a valid Afghan phone number (+937xxxxxxxx or +938xxxxxxxx, etc.)
  const phoneRegex = /^\+93[0-9]{9}$/
  if (!phoneRegex.test(normalizedPhone)) {
    return { isValid: false, error: 'Invalid Afghanistan phone number format' }
  }

  return { isValid: true, normalizedPhone }
}

// Email validation function
export const validateEmail = (
  email: string,
): { isValid: boolean; error?: string; normalizedEmail?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true, normalizedEmail: email.toLowerCase().trim() }
}

// Password validation function
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  return { isValid: true }
}

// Full name validation function
export const validateFullName = (
  fullName: string,
): { isValid: boolean; error?: string; normalizedName?: string } => {
  if (!fullName || fullName.trim() === '') {
    return { isValid: false, error: 'Full name is required' }
  }

  const trimmed = fullName.trim()
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' }
  }

  return { isValid: true, normalizedName: trimmed }
}

// Gender validation function
export const validateGender = (gender: string): { isValid: boolean; error?: string } => {
  if (!gender) {
    return { isValid: false, error: 'Please select a gender' }
  }

  if (!['male', 'female'].includes(gender)) {
    return { isValid: false, error: 'Invalid gender selection' }
  }

  return { isValid: true }
}

// Login validation function
export const validateLoginData = (data: { email: string; password: string }) => {
  const errors: Record<string, string> = {}

  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email or phone is required'
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Register validation function
export const validateRegisterData = (data: {
  email: string
  phone: string
  password: string
  confirmPassword: string
  fullName: string
  fatherName?: string
  gender: string
}) => {
  const errors: Record<string, string> = {}

  // Validate email
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!
  }

  // Validate phone
  const phoneValidation = validatePhone(data.phone)
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error!
  }

  // Validate password
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error!
  }

  // Validate confirm password
  if (!data.confirmPassword || data.confirmPassword.trim() === '') {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  // Validate full name
  const fullNameValidation = validateFullName(data.fullName)
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error!
  }

  // Validate gender
  const genderValidation = validateGender(data.gender)
  if (!genderValidation.isValid) {
    errors.gender = genderValidation.error!
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: {
      email: emailValidation.normalizedEmail || data.email,
      phone: phoneValidation.normalizedPhone || data.phone,
      fullName: fullNameValidation.normalizedName || data.fullName,
      fatherName: data.fatherName?.trim() || '',
      gender: data.gender,
      password: data.password,
    },
  }
}

// Profile validation function
export const validateProfileData = (data: {
  fullName: string
  fatherName: string
  gender: string
}) => {
  const errors: Record<string, string> = {}

  // Validate full name
  const fullNameValidation = validateFullName(data.fullName)
  if (!fullNameValidation.isValid) {
    errors.fullName = fullNameValidation.error!
  }

  // Validate gender
  const genderValidation = validateGender(data.gender)
  if (!genderValidation.isValid) {
    errors.gender = genderValidation.error!
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: {
      fullName: fullNameValidation.normalizedName || data.fullName,
      fatherName: data.fatherName?.trim() || '',
      gender: data.gender,
    },
  }
}

// Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  phone: string
  password: string
  confirmPassword: string
  fullName: string
  fatherName?: string
  gender: 'male' | 'female'
}

export interface ProfileUpdateData {
  fullName: string
  fatherName: string
  gender: 'male' | 'female'
}
