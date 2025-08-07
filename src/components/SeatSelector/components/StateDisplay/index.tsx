import React, { memo } from 'react'
import { AlertCircle, Info, Loader2 } from 'lucide-react'
import './index.scss'

interface StateDisplayProps {
  type: 'info' | 'error' | 'loading' | 'warning'
  children?: React.ReactNode
}

export const StateDisplay = memo<StateDisplayProps>(({ type, children }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={32} className="state-display__icon" aria-hidden="true" />
      case 'loading':
        return (
          <Loader2
            size={32}
            className="state-display__icon state-display__icon--spinning"
            aria-hidden="true"
          />
        )
      case 'warning':
        return <AlertCircle size={32} className="state-display__icon" aria-hidden="true" />
      default:
        return <Info size={32} className="state-display__icon" aria-hidden="true" />
    }
  }

  return (
    <div
      className={`state-display state-display--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {getIcon()}
      <div className="state-display__content">{children}</div>
    </div>
  )
})

StateDisplay.displayName = 'StateDisplay'
