import React from 'react'
import Link from 'next/link'

interface LogoProps {
  variant?: 'nav' | 'auth'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  subtitle?: string
  linkTo?: string
  className?: string
}

export const Logo = ({
  variant = 'nav',
  size = 'md',
  title,
  subtitle,
  linkTo,
  className = '',
}: LogoProps) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-xl',
      iconText: 'text-sm',
    },
    md: {
      icon: 'w-12 h-12',
      text: 'text-2xl',
      iconText: 'text-lg',
    },
    lg: {
      icon: 'w-16 h-16',
      text: 'text-3xl',
      iconText: 'text-xl',
    },
  }

  const config = sizeConfig[size]

  // Logo content
  const logoContent = (
    <>
      {/* Icon */}
      <div
        className={`${config.icon} bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center ${variant === 'nav' ? 'group-hover:scale-105 transition-transform duration-200' : 'mb-4'}`}
      >
        <span className={`text-white font-bold ${config.iconText}`}>H</span>
      </div>

      {/* Text */}
      <div className={variant === 'auth' ? 'text-center' : ''}>
        <h1
          className={`${config.text} font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent ${variant === 'auth' ? 'mb-2' : ''}`}
        >
          {title || 'Hesaarak'}
        </h1>

        {subtitle && variant === 'auth' && <p className="text-gray-600">{subtitle}</p>}
      </div>
    </>
  )

  // Wrapper based on variant
  if (variant === 'nav') {
    const content = (
      <div className={`group flex items-center space-x-2 ${className}`}>{logoContent}</div>
    )

    return linkTo ? (
      <Link href={linkTo} className="flex-shrink-0">
        {content}
      </Link>
    ) : (
      content
    )
  }

  // Auth variant (centered)
  return (
    <div className={`${variant === 'auth' ? 'text-center mb-8' : ''} ${className}`}>
      {linkTo ? <Link href={linkTo}>{logoContent}</Link> : logoContent}
    </div>
  )
}
