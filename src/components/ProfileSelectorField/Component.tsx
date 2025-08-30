'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  useField,
  FieldLabel,
  FieldError,
  useTranslation,
  useDocumentDrawer,
  EditIcon,
  XIcon,
  ChevronIcon,
  SearchIcon,
  PlusIcon,
} from '@payloadcms/ui'
import { User, Phone } from 'lucide-react'
import type { Props, Profile } from './types'
import { getClientSideURL } from '@/utils/getURL'

import './index.scss'

export const ProfileSelectorField: React.FC<Props> = (props) => {
  const { field, path, readOnly, validate } = props

  // PayloadCMS hooks
  const { value, setValue, showError, errorMessage } = useField({ path, validate })
  const { i18n } = useTranslation()

  // Component state
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  // Document drawers for create/edit
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    collectionSlug: 'profiles',
  })
  const [EditDocumentDrawer, EditDocumentDrawerToggler] = useDocumentDrawer({
    collectionSlug: 'profiles',
    id: selectedProfile?.id,
  })
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // API configuration
  const serverURL = getClientSideURL()
  const apiPath = '/api'

  // Language support
  const isPersian = i18n.language === 'fa'
  const isRTL = isPersian

  // Translations
  const t = {
    selectProfile: isPersian ? 'انتخاب پروفایل' : 'Select profile',
    searchPlaceholder: isPersian
      ? 'جستجو براساس نام، نام پدر، یا شماره تلفن...'
      : 'Search by name, father name, or phone...',
    loadingProfiles: isPersian ? 'در حال بارگذاری پروفایل‌ها...' : 'Loading profiles...',
    noProfilesMatch: isPersian
      ? 'هیچ پروفایلی با جستجوی شما مطابقت ندارد'
      : 'No profiles match your search',
    noProfilesAvailable: isPersian ? 'هیچ پروفایلی موجود نیست' : 'No profiles available',
    clearSelection: isPersian ? 'پاک کردن انتخاب' : 'Clear selection',
    createNewProfile: isPersian ? 'ایجاد پروفایل جدید' : 'Create new profile',
    addNew: isPersian ? 'افزودن جدید' : 'Add new',
  }

  // Load profiles from API
  const loadProfiles = useCallback(async () => {
    if (!serverURL || !apiPath) return

    setIsLoading(true)
    try {
      const response = await fetch(`${serverURL}${apiPath}/profiles?limit=200&depth=0`)
      if (response.ok) {
        const data = await response.json()
        const profileData: Profile[] =
          data.docs?.map((profile: any) => ({
            id: profile.id,
            fullName: profile.fullName || '',
            fatherName: profile.fatherName || '',
            phoneNumber: profile.phoneNumber || '',
            gender: profile.gender || 'male',
          })) || []
        setProfiles(profileData)
        setFilteredProfiles(profileData)
      }
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [serverURL, apiPath])

  // Load selected profile when value changes
  const loadSelectedProfile = useCallback(
    async (profileId: string) => {
      if (!serverURL || !apiPath) return

      try {
        const response = await fetch(`${serverURL}${apiPath}/profiles/${profileId}?depth=0`)
        if (response.ok) {
          const profile = await response.json()
          setSelectedProfile({
            id: profile.id,
            fullName: profile.fullName || '',
            fatherName: profile.fatherName || '',
            phoneNumber: profile.phoneNumber || '',
            gender: profile.gender || 'male',
          })
        }
      } catch (error) {
        console.error('Failed to load selected profile:', error)
      }
    },
    [serverURL, apiPath],
  )

  // Initialize data
  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  // Handle value changes
  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        loadSelectedProfile(value)
      } else if (typeof value === 'object' && value && 'id' in value) {
        const profileValue = value as Profile
        setSelectedProfile(profileValue)
      }
    } else {
      setSelectedProfile(null)
    }
  }, [value, loadSelectedProfile])

  // Filter profiles based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProfiles(profiles)
      return
    }

    const filtered = profiles.filter((profile) => {
      const searchLower = searchTerm.toLowerCase()
      const fullName = profile.fullName?.toLowerCase() || ''
      const fatherName = profile.fatherName?.toLowerCase() || ''
      const phoneNumber = profile.phoneNumber?.toLowerCase() || ''
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

  // Handle outside clicks
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
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Event handlers
  const handleSelect = (profile: Profile) => {
    setValue(profile.id)
    setSelectedProfile(profile)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setValue(null)
    setSelectedProfile(null)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!readOnly) {
      setIsOpen(!isOpen)
    }
  }

  const getDisplayText = (profile: Profile) => {
    const parts = [profile.fullName]
    if (profile.fatherName && profile.fatherName.trim()) {
      parts.push(`(${profile.fatherName})`)
    }
    return parts.join(' ')
  }

  // Handle document drawer saves
  const onCreateSave = useCallback(
    ({ doc }: { doc: any; operation: 'create' | 'update' }) => {
      setValue(doc.id)
      const newProfile: Profile = {
        id: doc.id,
        fullName: doc.fullName || '',
        fatherName: doc.fatherName || '',
        phoneNumber: doc.phoneNumber || '',
        gender: doc.gender || 'male',
      }
      setSelectedProfile(newProfile)
      loadProfiles()
    },
    [setValue, loadProfiles],
  )

  const onEditSave = useCallback(
    ({ doc }: { doc: any; operation: 'create' | 'update' }) => {
      if (doc.id === selectedProfile?.id) {
        const updatedProfile: Profile = {
          id: doc.id,
          fullName: doc.fullName || '',
          fatherName: doc.fatherName || '',
          phoneNumber: doc.phoneNumber || '',
          gender: doc.gender || 'male',
        }
        setSelectedProfile(updatedProfile)
        loadProfiles()
      }
    },
    [selectedProfile?.id, loadProfiles],
  )

  return (
    <div
      className={`field-type relationship profile-selector-field${
        field.admin?.allowCreate ? ' relationship--allow-create' : ''
      }`}
      ref={wrapperRef}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <FieldLabel
        htmlFor={path}
        label={typeof field.label === 'function' ? undefined : field.label || undefined}
        required={field.required}
      />

      <div className="field-type__wrap">
        <div className="relationship__wrap">
          <div
            className={`rs__control${
              isOpen ? ' rs__control--is-focused rs__control--menu-is-open' : ''
            }`}
            onClick={handleToggle}
          >
            <div className="rs__value-container">
              {selectedProfile ? (
                <div className="relationship--single-value">
                  <div className="relationship--single-value__label">
                    <div className="relationship--single-value__label-text">
                      <div className="relationship--single-value__text">
                        {getDisplayText(selectedProfile)}
                      </div>
                    </div>
                    {field.admin?.allowEdit !== false && (
                      <EditDocumentDrawerToggler
                        className="relationship--single-value__drawer-toggler"
                        aria-label={`Edit ${selectedProfile.fullName}`}
                        onClick={(e?: React.MouseEvent) => {
                          e?.stopPropagation()
                        }}
                      >
                        <EditIcon className="icon icon--edit" />
                      </EditDocumentDrawerToggler>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rs__placeholder">{t.selectProfile}</div>
              )}
            </div>

            <div className="rs__indicators">
              {!readOnly && selectedProfile && (
                <>
                  <div
                    className="clear-indicator"
                    role="button"
                    tabIndex={0}
                    onClick={handleClear}
                    aria-label={t.clearSelection}
                  >
                    <XIcon className="icon icon--x" />
                  </div>
                  <span className="rs__indicator-separator" />
                </>
              )}
              {!readOnly && (
                <button
                  className="dropdown-indicator"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle()
                  }}
                  aria-label={isOpen ? 'Close dropdown' : 'Open dropdown'}
                >
                  <ChevronIcon
                    className={`icon icon--chevron${
                      isOpen ? ' dropdown-indicator__icon--flipped' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && !readOnly && (
              <div className="rs__menu">
                <div className="rs__menu-list">
                  {/* Search Input */}
                  <div className="profile-search-section">
                    <div className="profile-search-wrapper">
                      <SearchIcon />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="profile-search-input"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div className="profile-options-container">
                    {isLoading ? (
                      <div className="profile-option profile-option--loading">
                        {t.loadingProfiles}
                      </div>
                    ) : filteredProfiles.length === 0 ? (
                      <div className="profile-option profile-option--no-results">
                        {searchTerm.trim() ? t.noProfilesMatch : t.noProfilesAvailable}
                      </div>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`profile-option${
                            selectedProfile?.id === profile.id ? ' profile-option--selected' : ''
                          }`}
                          onClick={() => handleSelect(profile)}
                          role="option"
                          aria-selected={selectedProfile?.id === profile.id}
                        >
                          <div className="profile-option-content">
                            <User
                              className={`profile-icon profile-icon--${profile.gender || 'male'}`}
                            />
                            <div className="profile-details">
                              <div className="profile-name">{getDisplayText(profile)}</div>
                              {profile.phoneNumber && (
                                <div className="profile-phone">
                                  <Phone className="phone-icon" />
                                  <span>{profile.phoneNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add New Button - inline with field */}
          {!readOnly && field.admin?.allowCreate && (
            <div className="relationship-add-new">
              <DocumentDrawerToggler
                className="relationship-add-new__add-button"
                title={t.createNewProfile}
                aria-label={t.createNewProfile}
              >
                <PlusIcon />
              </DocumentDrawerToggler>
            </div>
          )}
        </div>
      </div>

      <FieldError showError={showError} message={errorMessage} />

      {/* Document Drawers */}
      {field.admin?.allowCreate && <DocumentDrawer onSave={onCreateSave} />}
      {field.admin?.allowEdit !== false && selectedProfile && (
        <EditDocumentDrawer onSave={onEditSave} />
      )}
    </div>
  )
}

export default ProfileSelectorField
