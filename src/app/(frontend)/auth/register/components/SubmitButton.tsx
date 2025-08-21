'use client'

import { CheckCircle, Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  isLoading: boolean
  isSuccess: boolean
  disabled: boolean
  onClick?: () => void
}

export const SubmitButton = ({ isLoading, isSuccess, disabled, onClick }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 relative overflow-hidden mt-6"
    >
      <div className="relative z-10">
        {isSuccess ? (
          <div className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            <span>Registration Successful!</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Creating Account...
          </div>
        ) : (
          'Create Account'
        )}
      </div>
    </button>
  )
}
