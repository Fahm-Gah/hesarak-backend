import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logoImage from '/public/images/logo.png'

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
  // Size configurations for the logo image
  const sizeConfig = {
    sm: {
      width: 50,
      height: 50,
      text: 'text-lg',
    },
    md: {
      width: 80,
      height: 80,
      text: 'text-xl',
    },
    lg: {
      width: 120,
      height: 120,
      text: 'text-3xl',
    },
  }

  const config = sizeConfig[size]

  // Logo content
  const logoContent = (
    <>
      {/* Logo Image */}
      <div
        className={`flex items-center justify-center ${variant === 'nav' ? 'group-hover:scale-105 transition-transform duration-200' : 'mb-4'}`}
      >
        <Image
          alt="حصارک پنجشیر لوگو"
          width={config.width}
          height={config.height}
          src={logoImage}
          priority={variant === 'nav'} // Prioritize nav logo loading
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
      <div className={`group flex items-center space-x-reverse space-x-3 ${className}`}>
        {logoContent}
      </div>
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
    <div
      className={`${variant === 'auth' ? 'text-center mb-8' : 'flex items-center justify-center'} ${className}`}
    >
      {linkTo ? <Link href={linkTo}>{logoContent}</Link> : logoContent}
    </div>
  )
}
