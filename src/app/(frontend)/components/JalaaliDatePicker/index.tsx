'use client'

import React, { useState } from 'react'
import { JalaaliDateField } from './JalaaliDateField'
import { JalaaliDatePickerDropdown } from './JalaaliDatePickerDropdown'

interface JalaaliDatePickerProps {
  value: { year: number; month: number; day: number }
  onChange: (date: { year: number; month: number; day: number }) => void
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
  showIcon?: boolean
  disabled?: boolean
  placeholder?: string
}

export const JalaaliDatePicker = ({
  value,
  onChange,
  label,
  className = '',
  size = 'md',
  variant = 'default',
  showIcon = true,
  disabled = false,
  placeholder,
}: JalaaliDatePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

  // Function to calculate dropdown position
  const calculateDropdownPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 400 // Approximate height of the calendar dropdown
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    // If there's not enough space below but enough space above, position it above
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
  }

  const containerRef = React.useRef<HTMLDivElement>(null)

  // Handle scroll events to reposition dropdown
  React.useEffect(() => {
    const handleScroll = () => {
      if (showDatePicker && containerRef.current) {
        const inputElement = containerRef.current.querySelector('[role="button"]') as HTMLElement
        if (inputElement) {
          calculateDropdownPosition(inputElement)
        }
      }
    }

    if (showDatePicker) {
      window.addEventListener('scroll', handleScroll, true) // Use capture to catch all scroll events
      window.addEventListener('resize', handleScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [showDatePicker])

  const handleFieldClick = () => {
    if (disabled) return

    if (containerRef.current && !showDatePicker) {
      const inputElement = containerRef.current.querySelector('[role="button"]') as HTMLElement
      if (inputElement) {
        calculateDropdownPosition(inputElement)
      }
    }
    setShowDatePicker(!showDatePicker)
  }

  const handleDateChange = (date: { year: number; month: number; day: number }) => {
    onChange(date)
    setShowDatePicker(false)
  }

  const handleClose = () => {
    setShowDatePicker(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <JalaaliDateField
        value={value}
        onClick={handleFieldClick}
        label={label}
        size={size}
        variant={variant}
        showIcon={showIcon}
        disabled={disabled}
        placeholder={placeholder}
      />

      <JalaaliDatePickerDropdown
        value={value}
        onChange={handleDateChange}
        onClose={handleClose}
        isVisible={showDatePicker}
        position={dropdownPosition}
      />
    </div>
  )
}

// Export individual components for direct use
export { JalaaliDateField } from './JalaaliDateField'
export { JalaaliDatePickerDropdown } from './JalaaliDatePickerDropdown'
