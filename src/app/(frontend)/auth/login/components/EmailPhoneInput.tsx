interface EmailPhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  autoComplete?: string
}

export const EmailPhoneInput = ({
  value,
  onChange,
  disabled = false,
  error,
  autoComplete = 'username',
}: EmailPhoneInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone *</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
        }`}
        placeholder="Enter your email or phone number"
        required
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
