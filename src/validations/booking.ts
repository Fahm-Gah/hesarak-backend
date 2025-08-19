import { validateDate } from '../utils/dateUtils'

/**
 * Booking request interface
 */
export interface BookingRequest {
  tripId: string
  date: string
  seatIds: string[]
  paymentMethod?: 'cash' | 'card' | 'mobile'
  fromTerminalId?: string // Optional: user's boarding terminal
  toTerminalId?: string   // Optional: user's destination terminal
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  data?: BookingRequest
}

/**
 * Validates trip ID format
 */
const validateTripId = (tripId: unknown): string | null => {
  if (!tripId) {
    return 'Trip ID is required'
  }

  if (typeof tripId !== 'string') {
    return 'Trip ID must be a string'
  }

  if (tripId.trim().length === 0) {
    return 'Trip ID cannot be empty'
  }

  // Basic MongoDB ObjectId validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(tripId.trim())) {
    return 'Trip ID must be a valid ObjectId'
  }

  return null
}

/**
 * Validates seat IDs array
 */
const validateSeatIds = (seatIds: unknown): string | null => {
  if (!seatIds) {
    return 'Seat IDs are required'
  }

  if (!Array.isArray(seatIds)) {
    return 'Seat IDs must be an array'
  }

  if (seatIds.length === 0) {
    return 'At least one seat ID is required'
  }

  if (seatIds.length > 2) {
    return 'Maximum 2 seats allowed per booking'
  }

  // Check each seat ID
  for (let i = 0; i < seatIds.length; i++) {
    const seatId = seatIds[i]
    if (!seatId || typeof seatId !== 'string') {
      return `Seat ID at index ${i} must be a non-empty string`
    }

    const trimmedId = seatId.trim()
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId)
    const isPositionId = /^[0-9]+-[0-9]+-[0-9]+$/.test(trimmedId)
    const isNanoid = /^[A-Za-z0-9_-]{10,30}$/.test(trimmedId)

    if (!isObjectId && !isPositionId && !isNanoid) {
      return `Seat ID at index ${i} must be a valid ObjectId, position-based ID, or nanoid`
    }
  }

  // Check for duplicates
  const uniqueIds = new Set(seatIds)
  if (uniqueIds.size !== seatIds.length) {
    return 'Duplicate seat IDs are not allowed'
  }

  return null
}

/**
 * Validates payment method
 */
const validatePaymentMethod = (paymentMethod: unknown): string | null => {
  if (!paymentMethod) {
    return null // Optional field
  }

  if (typeof paymentMethod !== 'string') {
    return 'Payment method must be a string'
  }

  const validMethods = ['cash', 'card', 'mobile']
  if (!validMethods.includes(paymentMethod)) {
    return `Payment method must be one of: ${validMethods.join(', ')}`
  }

  return null
}

/**
 * Validates terminal ID (optional field)
 */
const validateTerminalId = (terminalId: unknown, fieldName: string): string | null => {
  if (!terminalId) {
    return null // Optional field
  }

  if (typeof terminalId !== 'string') {
    return `${fieldName} must be a string`
  }

  const trimmed = terminalId.trim()
  if (trimmed.length === 0) {
    return `${fieldName} cannot be empty`
  }

  // Basic MongoDB ObjectId validation (24 hex characters)
  if (!/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    return `${fieldName} must be a valid ObjectId`
  }

  return null
}

/**
 * Validates the entire booking request
 */
export const validateBookingRequest = (requestBody: unknown): ValidationResult => {
  const errors: string[] = []

  if (!requestBody || typeof requestBody !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object'],
    }
  }

  const body = requestBody as any

  // Validate trip ID
  const tripIdError = validateTripId(body.tripId)
  if (tripIdError) {
    errors.push(tripIdError)
  }

  // Validate date
  if (!body.date) {
    errors.push('Date is required')
  } else if (typeof body.date !== 'string') {
    errors.push('Date must be a string')
  } else {
    const dateValidation = validateDate(body.date)
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error || 'Invalid date format')
    }
  }

  // Validate seat IDs
  const seatIdsError = validateSeatIds(body.seatIds)
  if (seatIdsError) {
    errors.push(seatIdsError)
  }

  // Validate payment method (optional)
  const paymentMethodError = validatePaymentMethod(body.paymentMethod)
  if (paymentMethodError) {
    errors.push(paymentMethodError)
  }

  // Validate terminal IDs (optional)
  const fromTerminalError = validateTerminalId(body.fromTerminalId, 'From terminal ID')
  if (fromTerminalError) {
    errors.push(fromTerminalError)
  }

  const toTerminalError = validateTerminalId(body.toTerminalId, 'To terminal ID')
  if (toTerminalError) {
    errors.push(toTerminalError)
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    }
  }

  // Return validated and cleaned data
  const validatedData: BookingRequest = {
    tripId: body.tripId.trim(),
    date: body.date.trim(),
    seatIds: body.seatIds.map((id: string) => id.trim()),
    paymentMethod: body.paymentMethod || 'cash', // Default to cash
    fromTerminalId: body.fromTerminalId ? body.fromTerminalId.trim() : undefined,
    toTerminalId: body.toTerminalId ? body.toTerminalId.trim() : undefined,
  }

  return {
    isValid: true,
    errors: [],
    data: validatedData,
  }
}

/**
 * Validates booking constraints (business logic)
 */
export interface BookingConstraints {
  maxSeatsPerUser: number
  maxSeatsPerBooking: number
  minBookingTime: number // minutes before departure
  allowedPaymentMethods: string[]
}

export const defaultBookingConstraints: BookingConstraints = {
  maxSeatsPerUser: 2,
  maxSeatsPerBooking: 2,
  minBookingTime: 30, // 30 minutes before departure
  allowedPaymentMethods: ['cash', 'card', 'mobile'],
}

/**
 * Validates business constraints for booking
 */
export const validateBookingConstraints = (
  request: BookingRequest,
  constraints: BookingConstraints = defaultBookingConstraints,
): ValidationResult => {
  const errors: string[] = []

  // Check seat count limits
  if (request.seatIds.length > constraints.maxSeatsPerBooking) {
    errors.push(`Maximum ${constraints.maxSeatsPerBooking} seats allowed per booking`)
  }

  // Check payment method
  if (request.paymentMethod && !constraints.allowedPaymentMethods.includes(request.paymentMethod)) {
    errors.push(`Payment method must be one of: ${constraints.allowedPaymentMethods.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: request,
  }
}
