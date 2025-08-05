import React from 'react'
import { AlertCircle, Info } from 'lucide-react'
import './index.scss' // Import the component's own SCSS file

interface StateDisplayProps {
  type: 'info' | 'error'
  children: React.ReactNode
}

/**
 * A reusable component to display different states like info or errors.
 * It provides a consistent look and feel with a dedicated icon and styling,
 * making messages clear and visually distinct.
 */
export const StateDisplay: React.FC<StateDisplayProps> = ({ type, children }) => {
  const Icon = type === 'error' ? AlertCircle : Info

  return (
    <div className={`state-display state-display--${type}`}>
      {/* Explicitly set icon size and add a class for SCSS targeting */}
      <Icon size={32} className="state-display__icon" aria-hidden="true" />
      <div className="state-display__content">{children}</div>{' '}
      {/* Wrap children for flex control */}
    </div>
  )
}
