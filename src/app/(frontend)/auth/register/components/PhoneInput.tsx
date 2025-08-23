interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
}

export const PhoneInput = ({ value, onChange, disabled = false, error }: PhoneInputProps) => {
  const handleChange = (inputValue: string) => {
    // Only allow digits and limit to 9 characters
    let cleanValue = inputValue.replace(/\D/g, '')
    // Remove leading 0 if present
    if (cleanValue.startsWith('0')) {
      cleanValue = cleanValue.substring(1)
    }
    // Limit to 9 digits
    cleanValue = cleanValue.substring(0, 9)
    onChange(cleanValue)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">شماره تلفن *</label>
      <div dir="ltr" className="flex w-full">
        {/* Country Code Selector (Fixed) */}
        <div className="flex items-center px-3 py-3 border border-gray-300 rounded-l-lg bg-gray-100 border-l-0 flex-shrink-0">
          <span className="text-gray-700 font-medium">+93</span>
        </div>
        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`flex-1 min-w-0 px-4 py-3 border rounded-r-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
            error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
          }`}
          placeholder="701234567"
          maxLength={9}
          required
          disabled={disabled}
          autoComplete="tel"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">۹ رقم بدون صفر اول وارد کنید</p>
    </div>
  )
}
