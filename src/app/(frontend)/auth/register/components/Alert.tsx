import { AlertCircle, CheckCircle } from 'lucide-react'

interface AlertProps {
  type: 'error' | 'success'
  message: string
}

export const Alert = ({ type, message }: AlertProps) => {
  const isError = type === 'error'

  return (
    <div
      className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
        isError
          ? 'bg-red-50 border-l-red-500 border-red-100'
          : 'bg-green-50 border-l-green-500 border-green-100'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${isError ? 'text-red-800' : 'text-green-800'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
