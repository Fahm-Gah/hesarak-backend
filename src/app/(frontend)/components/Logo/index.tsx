import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
    },
    md: {
      icon: 'w-12 h-12',
      text: 'text-2xl',
    },
    lg: {
      icon: 'w-16 h-16',
      text: 'text-3xl',
    },
  }

  const config = sizeConfig[size]

  // Logo content
  const logoContent = (
    <>
      {/* Logo Image */}
      <div
        className={`${config.icon} relative ${variant === 'nav' ? 'group-hover:scale-105 transition-transform duration-200' : 'mb-4'}`}
      >
        <Image
          src="/images/hesarak-logo-transparent.png"
          alt="Hesarakbus Logo"
          fill
          sizes="(max-width: 768px) 32px, (max-width: 1200px) 48px, 64px"
          className="object-contain"
          priority
        />
      </div>

      {/* Text */}
      <div className={variant === 'auth' ? 'text-center' : ''}>
        <h1
          className={`${config.text} font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent ${variant === 'auth' ? 'mb-2' : ''}`}
        >
          {title || 'حصارک‌بس'}
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
