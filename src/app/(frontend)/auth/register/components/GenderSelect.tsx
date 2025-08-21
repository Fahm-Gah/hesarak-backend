'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface GenderOption {
  value: 'male' | 'female'
  label: string
}

interface GenderSelectProps {
  value: 'male' | 'female'
  onChange: (value: 'male' | 'female') => void
  disabled?: boolean
  error?: string
}

const genderOptions: GenderOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const GenderSelect = ({ value, onChange, disabled = false, error }: GenderSelectProps) => {
  const [showDropdown, setShowDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        const target = event.target as Element
        const dropdown = document.querySelector('.gender-dropdown')

        if (dropdown && !dropdown.contains(target)) {
          setShowDropdown(false)
        }
      }
    }

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDropdown])

  const selectedGender = genderOptions.find((option) => option.value === value)

  return (
    <div className="gender-dropdown">
      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowDropdown(!showDropdown)
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 flex items-center justify-between ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
          }`}
          disabled={disabled}
        >
          <div className="flex items-center">
            <span className="text-gray-900">{selectedGender?.label}</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(option.value)
                  setShowDropdown(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center ${
                  value === option.value ? 'bg-orange-50 text-orange-700' : 'text-gray-900'
                }`}
                disabled={disabled}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-5 h-5 ml-auto text-orange-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
