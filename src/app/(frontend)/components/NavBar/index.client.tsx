'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@/payload-types'
import { getMeUser } from '@/utils/getMeUser.client'
import { Logo } from '@/app/(frontend)/components/Logo'

export const NavBarClient = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const closeDropdown = useCallback(() => {
    setIsProfileDropdownOpen(false)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Load user auth state
  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const result = await getMeUser()
      if (isMounted) {
        setUser(result.user)
        setLoading(false)
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle dropdown/menu closing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isProfileDropdownOpen) {
          closeDropdown()
        }
        if (isMobileMenuOpen) {
          closeMobileMenu()
        }
      }
    }

    if (isProfileDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileDropdownOpen, isMobileMenuOpen, closeDropdown, closeMobileMenu])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen((prev) => !prev)
  }, [])

  const navLinks = [
    { href: '/', label: 'صفحه اصلی' },
    { href: '/about', label: 'درباره ما' },
    { href: '/contact', label: 'تماس با ما' },
  ]

  const hasAdminRoles = user?.roles && user.roles.some((role) => role !== 'customer')

  const profileMenuItems = [
    ...(hasAdminRoles ? [{ href: '/admin', label: 'داشبورد', icon: '📊' }] : []),
    { href: '/profile', label: 'پروفایل', icon: '👤' },
    { href: '/my-tickets', label: 'تکت‌های من', icon: '🎫' },
    { href: '/auth/logout', label: 'خروج', icon: '🚪' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Logo variant="nav" size="md" linkTo="/" />

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-reverse space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-gray-700 hover:text-orange-500 font-medium text-sm transition-all duration-200 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 group-hover:w-full group-hover:left-0 transition-all duration-200 rounded-full"></span>
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-reverse space-x-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="منوی کاربری"
                >
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-gray-800 font-medium text-sm max-w-32 truncate">
                    {(typeof user.profile === 'object' && user.profile?.fullName) || user.email}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(typeof user.profile === 'object' &&
                        user.profile?.fullName?.charAt(0).toUpperCase()) ||
                        user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 transform transition-all duration-200 origin-top-left opacity-100 scale-100 translate-y-0 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {(typeof user.profile === 'object' && user.profile?.fullName) || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:bg-orange-50 focus:text-orange-600"
                        onClick={closeDropdown}
                        role="menuitem"
                      >
                        <span className="mr-3 text-base" aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-reverse space-x-3">
                <Link
                  href="/auth/login"
                  className="ml-2 px-4 py-2 text-gray-700 hover:text-orange-600 font-medium text-sm transition-all duration-200 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium text-sm hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="mx-4 sm:mx-6 lg:mx-8 px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg mt-2 mb-4 border border-gray-200 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:bg-orange-50 focus:text-orange-600"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-3 mt-3">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-gray-200 mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(typeof user.profile === 'object' &&
                            user.profile?.fullName?.charAt(0).toUpperCase()) ||
                            user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {(typeof user.profile === 'object' && user.profile?.fullName) ||
                            user.email}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:bg-orange-50 focus:text-orange-600"
                      onClick={closeMobileMenu}
                    >
                      <span className="ml-3 text-base" aria-hidden="true">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium text-center transition-all duration-200 focus:outline-none focus:bg-orange-50 focus:text-orange-600"
                    onClick={closeMobileMenu}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium text-center hover:from-orange-700 hover:to-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    onClick={closeMobileMenu}
                  >
                    ثبت‌نام
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
