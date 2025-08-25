'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FieldLabel, useConfig, FieldError, useField, useTranslation } from '@payloadcms/ui'
import { ChevronIcon } from '@payloadcms/ui/icons/Chevron'
import { SearchIcon } from '@payloadcms/ui/icons/Search'
import { XIcon } from '@payloadcms/ui/icons/X'
import type { Props, ProfileOption } from './types'
import type { Profile } from '@/payload-types'

import './index.scss'
import { Phone, User } from 'lucide-react'

const baseClass = 'profile-selector'

const ProfileSelector: React.FC<Props> = (props) => {
  const { path, field, readOnly } = props
  const { value, setValue, showError, errorMessage } = useField<string | null>({ path })
  const config = useConfig()
  const { i18n } = useTranslation()

  // Handle different config structures - safely access config properties
  const serverURL = (config as any)?.serverURL || ''
  const apiPath = (config as any)?.routes?.api || '/api'

  // Persian language support
  const isPersian = i18n.language === 'fa'
  const isRTL = isPersian

  // Translation strings
  const t = {
    selectProfile: isPersian ? 'پروفایل انتخاب کنید' : 'Select a profile',
    searchPlaceholder: isPersian
      ? 'جستجو براساس نام، نام پدر، یا شماره تلفن...'
      : 'Search by name, father name, or phone...',
    loadingProfiles: isPersian ? 'در حال بارگذاری پروفایل‌ها...' : 'Loading profiles...',
    noProfilesMatch: isPersian
      ? 'هیچ پروفایلی با جستجوی شما مطابقت ندارد'
      : 'No profiles match your search',
    noProfilesAvailable: isPersian ? 'هیچ پروفایلی موجود نیست' : 'No profiles available',
    clearSelection: isPersian ? 'پاک کردن انتخاب' : 'Clear selection',
    selectProfileRequired: isPersian ? 'انتخاب پروفایل (الزامی)' : 'Select profile (required)',
    selectProfileOptional: isPersian ? 'انتخاب پروفایل' : 'Select profile',
    profileOptions: isPersian ? 'گزینه‌های پروفایل' : 'Profile options',
    searchProfiles: isPersian ? 'جستجوی پروفایل‌ها' : 'Search profiles',
  }

  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Load profiles from the API
  const loadProfiles = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${serverURL}${apiPath}/profiles?limit=200&depth=0`)
      if (response.ok) {
        const data = await response.json()
        const profileOptions: ProfileOption[] =
          data.docs?.map((profile: Profile) => ({
            id: profile.id,
            fullName: profile.fullName,
            fatherName: profile.fatherName,
            phoneNumber: profile.phoneNumber,
            gender: profile.gender,
          })) || []
        setProfiles(profileOptions)
        setFilteredProfiles(profileOptions)
      } else {
        console.error('Failed to load profiles: HTTP', response.status)
        setProfiles([])
        setFilteredProfiles([])
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
      setProfiles([])
      setFilteredProfiles([])
    } finally {
      setIsLoading(false)
    }
  }, [serverURL, apiPath])

  // Load the currently selected profile details
  const loadSelectedProfile = useCallback(
    async (profileId: string) => {
      try {
        const response = await fetch(`${serverURL}${apiPath}/profiles/${profileId}?depth=0`)
        if (response.ok) {
          const profile = await response.json()
          setSelectedProfile({
            id: profile.id,
            fullName: profile.fullName || 'Unknown',
            fatherName: profile.fatherName,
            phoneNumber: profile.phoneNumber,
            gender: profile.gender,
          })
        } else {
          console.error('Failed to load selected profile: HTTP', response.status)
          setSelectedProfile(null)
        }
      } catch (error) {
        console.error('Failed to load selected profile:', error)
        setSelectedProfile(null)
      }
    },
    [serverURL, apiPath],
  )

  // Initialize profiles and selected profile
  useEffect(() => {
    loadProfiles()

    if (value) {
      if (typeof value === 'string') {
        loadSelectedProfile(value)
      } else if (typeof value === 'object' && value && 'id' in value) {
        const profileValue = value as Profile
        setSelectedProfile({
          id: profileValue.id,
          fullName: profileValue.fullName,
          fatherName: profileValue.fatherName,
          phoneNumber: profileValue.phoneNumber,
          gender: profileValue.gender,
        })
      }
    }
  }, [value, loadProfiles, loadSelectedProfile])

  // Filter profiles based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProfiles(profiles)
      return
    }

    const filtered = profiles.filter((profile) => {
      const searchLower = searchTerm.toLowerCase()
      const fullName = profile.fullName?.toLowerCase() || ''
      const fatherName = (profile.fatherName || '')?.toLowerCase() || ''
      const phoneNumber = (profile.phoneNumber || '')?.toLowerCase() || ''

      // Search in combined format: "fullName fatherName"
      const combinedName = `${fullName} ${fatherName}`.toLowerCase()

      return (
        fullName.includes(searchLower) ||
        fatherName.includes(searchLower) ||
        phoneNumber.includes(searchLower) ||
        combinedName.includes(searchLower)
      )
    })

    setFilteredProfiles(filtered)
  }, [searchTerm, profiles])

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearchTerm('')
      }
      // Arrow key navigation
      if (isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        // Focus management for better accessibility
        const options = dropdownRef.current?.querySelectorAll(
          `.${baseClass}__option:not(.${baseClass}__option--loading):not(.${baseClass}__option--no-results)`,
        )
        if (options && options.length > 0) {
          const currentFocused = document.activeElement
          const currentIndex = Array.from(options).indexOf(currentFocused as Element)

          let nextIndex = 0
          if (event.key === 'ArrowDown') {
            nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
          } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
          }

          ;(options[nextIndex] as HTMLElement).focus()
        }
      }
      // Enter key to select focused option
      if (event.key === 'Enter' && isOpen) {
        const focusedOption = document.activeElement
        if (focusedOption && focusedOption.classList.contains(`${baseClass}__option`)) {
          const profileId = focusedOption.getAttribute('data-profile-id')
          if (profileId) {
            const profile = filteredProfiles.find((p) => p.id === profileId)
            if (profile) {
              handleSelect(profile)
            }
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, filteredProfiles, baseClass])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    }
  }, [isOpen])

  const handleSelect = (profile: ProfileOption) => {
    setValue(profile.id)
    setSelectedProfile(profile)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue(null)
    setSelectedProfile(null)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!readOnly) {
      setIsOpen(!isOpen)
    }
  }

  const getDisplayText = (profile: ProfileOption) => {
    const parts = [profile.fullName]
    if (profile.fatherName && profile.fatherName.trim()) {
      parts.push(`(${profile.fatherName})`)
    }
    return parts.join(' ')
  }

  const getGenderIcon = (gender?: 'male' | 'female' | null) => {
    return (
      <User
        className={`${baseClass}__selected-display-icon ${baseClass}__selected-display-icon--${gender || 'male'}`}
      />
    )
  }

  const renderSelectedProfile = () => {
    if (!selectedProfile) {
      return (
        <span className="relationship-input-wrapper__input--placeholder">{t.selectProfile}</span>
      )
    }

    // For the main field display, show only the full name to keep it clean
    return <span>{selectedProfile.fullName}</span>
  }

  const renderDropdown = () => {
    if (!isOpen || readOnly) return null

    return (
      <div
        className={`${baseClass}__dropdown`}
        ref={dropdownRef}
        role="listbox"
        aria-label={t.profileOptions}
      >
        <div className={`${baseClass}__search`}>
          <div className={`${baseClass}__search-wrapper`}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="text"
              className={`${baseClass}__search-input`}
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={t.searchProfiles}
              autoComplete="off"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        <div className={`${baseClass}__options`}>
          {isLoading ? (
            <div
              className={`${baseClass}__option ${baseClass}__option--loading`}
              role="status"
              aria-live="polite"
            >
              {t.loadingProfiles}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className={`${baseClass}__option ${baseClass}__option--no-results`} role="status">
              {searchTerm.trim() ? t.noProfilesMatch : t.noProfilesAvailable}
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`${baseClass}__option ${selectedProfile?.id === profile.id ? `${baseClass}__option--selected` : ''}`}
                onClick={() => handleSelect(profile)}
                data-profile-id={profile.id}
                tabIndex={0}
                role="option"
                aria-selected={selectedProfile?.id === profile.id}
              >
                <div className={`${baseClass}__option-content`}>
                  <User
                    className={`${baseClass}__option-icon ${baseClass}__option-icon--${profile.gender || 'male'}`}
                  />
                  <div className={`${baseClass}__option-details`}>
                    <div className={`${baseClass}__option-name`}>{getDisplayText(profile)}</div>
                    {profile.phoneNumber && profile.phoneNumber.trim() && (
                      <div className={`${baseClass}__option-phone`}>
                        <Phone className={`${baseClass}__option-phone-icon`} />
                        {profile.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="field-type-relationship" ref={wrapperRef} dir={isRTL ? 'rtl' : 'ltr'}>
      <FieldLabel htmlFor={path} label={field.label} required={field.required} />

      <div className={`${baseClass}`}>
        <div className="relationship-input-wrapper">
          <div
            className={`relationship-input-wrapper__input ${selectedProfile ? 'relationship-input-wrapper__input--has-value' : ''} ${readOnly ? 'relationship-input-wrapper__input--read-only' : ''} ${showError ? 'relationship-input-wrapper__input--error' : ''} ${isOpen ? 'relationship-input-wrapper__input--open' : ''}`}
            onClick={handleToggle}
          >
            {renderSelectedProfile()}
          </div>

          {!readOnly && (
            <div className="relationship-input-wrapper__actions">
              {selectedProfile && (
                <button
                  type="button"
                  className="relationship-input-wrapper__clear-button"
                  onClick={handleClear}
                  title={t.clearSelection}
                >
                  <XIcon className="relationship-input-wrapper__clear-button-icon" />
                </button>
              )}
              <ChevronIcon />
            </div>
          )}
        </div>

        {renderDropdown()}
      </div>

      <FieldError showError={showError} message={errorMessage} />
    </div>
  )
}

export default ProfileSelector
