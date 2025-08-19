'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CalendarIcon } from '@payloadcms/ui/icons/Calendar'
import { XIcon } from '@payloadcms/ui/icons/X'
import { FieldLabel, useTranslation, useFormProcessing, FieldError, useField } from '@payloadcms/ui'
import moment from 'moment-jalaali'
import type { PersianDatePickerComponentProps } from './types'

const baseClass = 'date-time-picker'

const PersianDatePicker: React.FC<PersianDatePickerComponentProps> = (props) => {
  const fieldData = props.path ? useField<string | null>({ path: props.path }) : null

  const dateConfig = props.field?.admin?.date || {}

  const {
    value: propValue,
    onChange: propOnChange,
    readOnly: propReadOnly = false,
    disabled: propDisabled = false,
    placeholder,
    placeholderText = dateConfig.placeholderText,
    pickerAppearance = dateConfig.pickerAppearance || 'default',
    timeIntervals = dateConfig.timeIntervals || 30,
    minDate = dateConfig.minDate ? new Date(dateConfig.minDate) : undefined,
    maxDate = dateConfig.maxDate ? new Date(dateConfig.maxDate) : undefined,
    minTime = dateConfig.minTime ? new Date(dateConfig.minTime) : undefined,
    maxTime = dateConfig.maxTime ? new Date(dateConfig.maxTime) : undefined,
    filterDate = dateConfig.filterDate,
    displayFormat = dateConfig.displayFormat,
    customDisplayFormat = dateConfig.displayFormat,
    label = props.field?.label,
    required = props.field?.required || false,
    path,
    showLabel = true,
    showError = fieldData?.showError || false,
    errorMessage = fieldData?.errorMessage,
    monthsToShow = dateConfig.monthsToShow || 1,
    overrides = dateConfig.overrides || {},
    id,
  } = props

  const readOnly =
    (props.field?.admin as any)?.readOnly || dateConfig.readOnly || propReadOnly || false

  const disabled = propDisabled || readOnly

  const value = fieldData ? (fieldData.value ? new Date(fieldData.value) : null) : propValue
  const onChange = fieldData
    ? (date: Date | null) => fieldData.setValue(date?.toISOString() || null)
    : propOnChange
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'fa'
  const processing = useFormProcessing()

  const [isLoading, setIsLoading] = useState(true)
  const [internalValue, setInternalValue] = useState<string | null>(
    value ? (typeof value === 'string' ? value : value.toISOString()) : null,
  )

  const popperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeListRef = useRef<HTMLUListElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [popperPlacement, setPopperPlacement] = useState<'top' | 'bottom'>('bottom')

  const isDisabledState = disabled || readOnly || isLoading || processing

  const calculatePopperPosition = useCallback(() => {
    if (!inputRef.current) return

    const inputRect = inputRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const buffer = 20
    const defaultPopperHeight = 300

    const spaceBelow = viewportHeight - inputRect.bottom - buffer
    const spaceAbove = inputRect.top - buffer

    let popperHeight = defaultPopperHeight
    if (popperRef.current) {
      const popperRect = popperRef.current.getBoundingClientRect()
      if (popperRect.height > 0) {
        popperHeight = popperRect.height
      }
    }

    let optimalPlacement: 'top' | 'bottom' = 'bottom'

    if (spaceBelow >= popperHeight) {
      optimalPlacement = 'bottom'
    } else if (spaceAbove >= popperHeight) {
      optimalPlacement = 'top'
    } else {
      optimalPlacement = spaceAbove > spaceBelow ? 'top' : 'bottom'
    }

    setPopperPlacement((prevPlacement) =>
      prevPlacement !== optimalPlacement ? optimalPlacement : prevPlacement,
    )
  }, [])

  const updatePopperPosition = useCallback(() => {
    if (isOpen) {
      calculatePopperPosition()
    }
  }, [isOpen, calculatePopperPosition])

  const initialMoment = useMemo(() => {
    const dateValue = internalValue
    return dateValue ? moment(dateValue) : moment()
  }, [internalValue])

  const [currentYear, setCurrentYear] = useState(initialMoment.jYear())
  const [currentMonth, setCurrentMonth] = useState(initialMoment.jMonth() + 1)
  const [selectedHour, setSelectedHour] = useState(initialMoment.hour())
  const [selectedMinute, setSelectedMinute] = useState(initialMoment.minute())

  const monthNames = useMemo(() => {
    if (i18n.language === 'fa') {
      return [
        'حمل',
        'ثور',
        'جوزا',
        'سرطان',
        'اسد',
        'سنبله',
        'میزان',
        'عقرب',
        'قوس',
        'جدی',
        'دلو',
        'حوت',
      ]
    } else {
      return [
        'Hamal',
        'Sawr',
        'Jawza',
        'Saratan',
        'Asad',
        'Sunbula',
        'Mizan',
        'Aqrab',
        'Qaws',
        'Jadi',
        'Dalw',
        'Hut',
      ]
    }
  }, [i18n.language])

  const weekDayNames = useMemo(() => {
    if (i18n.language === 'fa') {
      return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
    } else {
      return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    }
  }, [i18n.language])

  const timeLabel = useMemo(() => {
    return i18n.language === 'fa' ? 'زمان' : 'Time'
  }, [i18n.language])

  useEffect(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (value) {
      const newValue = typeof value === 'string' ? value : value.toISOString()
      setInternalValue(newValue)
      const m = moment(newValue)
      setSelectedHour(m.hour())
      setSelectedMinute(m.minute())

      // Only update current month/year if the calendar is not open (user is not navigating)
      if (!isOpen) {
        setCurrentYear(m.jYear())
        setCurrentMonth(m.jMonth() + 1)
      }
    } else {
      setInternalValue(null)
    }
  }, [value, isOpen])

  // Handle click outside and ESC key
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscKey)

    // Calculate initial position when popper opens with cleanup
    const timeouts: NodeJS.Timeout[] = []
    timeouts.push(setTimeout(calculatePopperPosition, 0))
    timeouts.push(setTimeout(calculatePopperPosition, 10))
    timeouts.push(setTimeout(calculatePopperPosition, 50))

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      // Clear all timeouts to prevent memory leaks
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [isOpen, calculatePopperPosition])

  useEffect(() => {
    if (!isOpen) return

    let throttleTimeout: NodeJS.Timeout | null = null

    const throttledUpdate = () => {
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        updatePopperPosition()
        throttleTimeout = null
      }, 16) // ~60fps
    }

    const handleResize = () => updatePopperPosition()

    window.addEventListener('scroll', throttledUpdate, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    document.addEventListener('scroll', throttledUpdate, { capture: true, passive: true })

    return () => {
      window.removeEventListener('scroll', throttledUpdate)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('scroll', throttledUpdate, { capture: true })
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
    }
  }, [isOpen, updatePopperPosition])

  // Scroll to selected time
  useEffect(() => {
    if (isOpen && pickerAppearance === 'dayAndTime' && timeListRef.current) {
      const selectedItem = timeListRef.current.querySelector(
        '.react-datepicker__time-list-item--selected',
      )
      if (selectedItem) {
        timeListRef.current.scrollTop =
          (selectedItem as HTMLLIElement).offsetTop - timeListRef.current.offsetHeight / 2 + 15
      }
    }
  }, [isOpen, pickerAppearance])

  const toPersianDigits = useCallback((num: number | string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)])
  }, [])

  const formatTime12Hour = useCallback(
    (hour: number, minute: number, showPrefix: boolean = false): string => {
      if (i18n.language === 'fa') {
        const period = hour >= 12 ? 'ب.ظ' : 'ق.ظ'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const prefix = showPrefix ? 'ساعت ' : ''
        return `${prefix}${toPersianDigits(displayHour)}:${toPersianDigits(minute.toString().padStart(2, '0'))} ${period}`
      } else {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const prefix = showPrefix ? 'Time ' : ''
        return `${prefix}${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
      }
    },
    [toPersianDigits, i18n.language],
  )

  // Format date according to display format, similar to default DatePicker
  const getDateFormat = useCallback(() => {
    const customFormat = customDisplayFormat || displayFormat

    if (customFormat) {
      return customFormat
    }

    // Default formats based on picker appearance
    if (pickerAppearance === 'default') {
      return 'MM/dd/yyyy'
    } else if (pickerAppearance === 'dayAndTime') {
      return 'MMM d, yyy h:mm a'
    } else if (pickerAppearance === 'timeOnly') {
      return 'h:mm a'
    } else if (pickerAppearance === 'dayOnly') {
      return 'MMM dd'
    } else if (pickerAppearance === 'monthOnly') {
      return 'MMMM'
    }

    return 'MM/dd/yyyy'
  }, [customDisplayFormat, displayFormat, pickerAppearance])

  const displayValue = useMemo(() => {
    if (!internalValue) return placeholderText || placeholder || ''

    const m = moment(internalValue)
    const jYear = m.jYear()
    const jMonth = m.jMonth() + 1
    const jDay = m.jDate()
    const jHour = m.hour()
    const jMinute = m.minute()

    const dateFormat = getDateFormat()

    // If we have a custom display format, try to format according to that
    if (customDisplayFormat || displayFormat) {
      const gregorianDate = m.toDate()

      // Handle specific formats
      if (dateFormat === 'EEE, MMM d, yyyy') {
        if (i18n.language === 'fa') {
          const persianDayNames = [
            'یکشنبه',
            'دوشنبه',
            'سه‌شنبه',
            'چهارشنبه',
            'پنج‌شنبه',
            'جمعه',
            'شنبه',
          ]
          const persianMonthNames = [
            'حمل',
            'ثور',
            'جوزا',
            'سرطان',
            'اسد',
            'سنبله',
            'میزان',
            'عقرب',
            'قوس',
            'جدی',
            'دلو',
            'حوت',
          ]
          const dayOfWeek = persianDayNames[gregorianDate.getDay()]
          const month = persianMonthNames[jMonth - 1]
          return `${dayOfWeek}، ${toPersianDigits(jDay)} ${month} ${toPersianDigits(jYear)}`
        } else {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          const monthNames = [
            'Hamal',
            'Sawr',
            'Jawza',
            'Saratan',
            'Asad',
            'Sunbula',
            'Mizan',
            'Aqrab',
            'Qaws',
            'Jadi',
            'Dalw',
            'Hut',
          ]
          const dayOfWeek = dayNames[gregorianDate.getDay()]
          const month = monthNames[jMonth - 1]
          return `${dayOfWeek}, ${jDay} ${month} ${jYear}`
        }
      }

      if (dateFormat === 'MMM d, yyy h:mm a') {
        if (i18n.language === 'fa') {
          const month = monthNames[jMonth - 1]
          const timeStr = formatTime12Hour(jHour, jMinute)
          return `${toPersianDigits(jDay)} ${month} ${toPersianDigits(jYear)} ${timeStr}`
        } else {
          const month = monthNames[jMonth - 1]
          const timeStr = formatTime12Hour(jHour, jMinute)
          return `${jDay} ${month} ${jYear} ${timeStr}`
        }
      }

      if (dateFormat === 'h:mm a') {
        return formatTime12Hour(jHour, jMinute)
      }

      if (dateFormat === 'MMM dd') {
        if (i18n.language === 'fa') {
          const month = monthNames[jMonth - 1]
          const day = toPersianDigits(jDay.toString().padStart(2, '0'))
          return `${month} ${day}`
        } else {
          const month = monthNames[jMonth - 1]
          const day = jDay.toString().padStart(2, '0')
          return `${month} ${day}`
        }
      }

      if (dateFormat === 'MMMM') {
        if (i18n.language === 'fa') {
          return monthNames[jMonth - 1]
        } else {
          return monthNames[jMonth - 1]
        }
      }
    }

    // Default Persian/English formatting based on picker appearance
    switch (pickerAppearance) {
      case 'monthOnly':
        if (i18n.language === 'fa') {
          return `${toPersianDigits(jYear)}/${toPersianDigits(jMonth.toString().padStart(2, '0'))}`
        } else {
          return `${jYear}/${jMonth.toString().padStart(2, '0')}`
        }
      case 'dayOnly':
        if (i18n.language === 'fa') {
          return `${toPersianDigits(jYear)}/${toPersianDigits(jMonth.toString().padStart(2, '0'))}/${toPersianDigits(jDay.toString().padStart(2, '0'))}`
        } else {
          return `${jYear}/${jMonth.toString().padStart(2, '0')}/${jDay.toString().padStart(2, '0')}`
        }
      case 'dayAndTime':
        if (i18n.language === 'fa') {
          return `${toPersianDigits(jDay)} ${monthNames[jMonth - 1]} ${toPersianDigits(jYear)} | ${formatTime12Hour(jHour, jMinute)}`
        } else {
          return `${jDay} ${monthNames[jMonth - 1]} ${jYear} | ${formatTime12Hour(jHour, jMinute)}`
        }
      case 'timeOnly':
        return formatTime12Hour(jHour, jMinute)
      default:
        if (i18n.language === 'fa') {
          return `${toPersianDigits(jYear)}/${toPersianDigits(jMonth.toString().padStart(2, '0'))}/${toPersianDigits(jDay.toString().padStart(2, '0'))}`
        } else {
          return `${jYear}/${jMonth.toString().padStart(2, '0')}/${jDay.toString().padStart(2, '0')}`
        }
    }
  }, [
    internalValue,
    pickerAppearance,
    monthNames,
    toPersianDigits,
    formatTime12Hour,
    placeholderText,
    placeholder,
    getDateFormat,
    customDisplayFormat,
    displayFormat,
    i18n.language,
  ])

  const handleDateSelect = useCallback(
    (year: number, month: number, day: number) => {
      if (filterDate) {
        const persianDateString = `${year}/${month}/${day}`
        const gregorianMoment = moment(persianDateString, 'jYYYY/jM/jD')
        if (!filterDate(gregorianMoment.toDate())) {
          return
        }
      }

      const persianDateString = `${year}/${month}/${day}`
      const gregorianMoment = moment(persianDateString, 'jYYYY/jM/jD')

      if (gregorianMoment.isValid()) {
        const currentValMoment = internalValue ? moment(internalValue) : moment()

        // Set time based on picker appearance - similar to default DatePicker
        if (pickerAppearance === 'dayAndTime') {
          gregorianMoment.hour(selectedHour).minute(selectedMinute)
        } else if (['dayOnly', 'default', 'monthOnly'].includes(pickerAppearance)) {
          // For day-only pickers, set to noon to avoid timezone issues
          const tzOffset = gregorianMoment.toDate().getTimezoneOffset() / 60
          gregorianMoment.hour(12 - tzOffset).minute(0)
        } else {
          gregorianMoment.hour(currentValMoment.hour()).minute(currentValMoment.minute())
        }

        gregorianMoment.seconds(0).milliseconds(0)

        // Unless the dateFormat includes milliseconds, set milliseconds to 0
        const dateFormat = getDateFormat()
        if (!dateFormat.includes('SSS')) {
          gregorianMoment.milliseconds(0)
        }

        const newDate = gregorianMoment.toDate()
        setInternalValue(gregorianMoment.toISOString())
        onChange?.(newDate)
      }

      if (pickerAppearance !== 'dayAndTime') {
        setIsOpen(false)
      }
    },
    [
      onChange,
      pickerAppearance,
      selectedHour,
      selectedMinute,
      internalValue,
      filterDate,
      getDateFormat,
    ],
  )

  const handleTimeSelect = useCallback(
    (hour: number, minute: number) => {
      setSelectedHour(hour)
      setSelectedMinute(minute)
      const newMoment = (internalValue ? moment(internalValue) : moment()).hour(hour).minute(minute)
      const newDate = newMoment.toDate()
      setInternalValue(newMoment.toISOString())
      onChange?.(newDate)
      setIsOpen(false)
    },
    [internalValue, onChange],
  )

  const handleClear = useCallback(() => {
    setInternalValue(null)
    onChange?.(null)
  }, [onChange])

  const navigateMonth = useCallback(
    (direction: number) => {
      const newMoment = moment(`${currentYear}/${currentMonth}/1`, 'jYYYY/jM/jD').add(
        direction,
        'jMonth',
      )
      setCurrentYear(newMoment.jYear())
      setCurrentMonth(newMoment.jMonth() + 1)
    },
    [currentMonth, currentYear],
  )

  const calendarGrid = useMemo(() => {
    const days = []
    const firstDayOfMonth = moment(`${currentYear}/${currentMonth}/1`, 'jYYYY/jM/jD')
    const daysInMonth = moment.jDaysInMonth(currentYear, currentMonth - 1)
    const firstWeekday = (firstDayOfMonth.day() + 1) % 7 // 0:Sat, 1:Sun, ...

    const prevMonthMoment = firstDayOfMonth.clone().subtract(1, 'jMonth')
    const daysInPrevMonth = moment.jDaysInMonth(prevMonthMoment.jYear(), prevMonthMoment.jMonth())

    for (let i = firstWeekday; i > 0; i--) {
      days.push({
        day: daysInPrevMonth - i + 1,
        month: prevMonthMoment.jMonth() + 1,
        year: prevMonthMoment.jYear(),
        isOutsideMonth: true,
      })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, month: currentMonth, year: currentYear, isOutsideMonth: false })
    }

    const nextMonthMoment = firstDayOfMonth.clone().add(1, 'jMonth')
    const totalCells = Math.ceil(days.length / 7) * 7
    let nextDay = 1
    while (days.length < totalCells) {
      days.push({
        day: nextDay++,
        month: nextMonthMoment.jMonth() + 1,
        year: nextMonthMoment.jYear(),
        isOutsideMonth: true,
      })
    }
    return days
  }, [currentYear, currentMonth])

  const timeList = useMemo(() => {
    const times = []
    for (let i = 0; i < 24 * 60; i += timeIntervals) {
      const hour = Math.floor(i / 60)
      const minute = i % 60
      times.push({ hour, minute })
    }
    return times
  }, [timeIntervals])

  const selectedJalaliDate = useMemo(() => {
    if (!internalValue) return null
    const m = moment(internalValue)
    return { year: m.jYear(), month: m.jMonth() + 1, day: m.jDate() }
  }, [internalValue])

  const isSelected = useCallback(
    (y: number, m: number, d: number) =>
      selectedJalaliDate
        ? y === selectedJalaliDate.year &&
          m === selectedJalaliDate.month &&
          d === selectedJalaliDate.day
        : false,
    [selectedJalaliDate],
  )

  const isToday = useCallback((y: number, m: number, d: number) => {
    const today = moment()
    return y === today.jYear() && m === today.jMonth() + 1 && d === today.jDate()
  }, [])

  const isDisabled = useCallback(
    (y: number, m: number, d: number) => {
      const date = moment(`${y}/${m}/${d}`, 'jYYYY/jM/jD')
      const isDateDisabled =
        (minDate && date.isBefore(moment(minDate), 'day')) ||
        (maxDate && date.isAfter(moment(maxDate), 'day'))

      if (isDateDisabled) return true

      if (filterDate) {
        return !filterDate(date.toDate())
      }

      return false
    },
    [minDate, maxDate, filterDate],
  )

  const isTimeDisabled = useCallback(
    (hour: number, minute: number) => {
      if (!minTime && !maxTime) return false

      const currentDate = internalValue ? moment(internalValue) : moment()
      const timeToCheck = currentDate.clone().hour(hour).minute(minute)

      if (minTime) {
        const minTimeMoment = moment(minTime)
        if (timeToCheck.isBefore(minTimeMoment, 'minute')) return true
      }

      if (maxTime) {
        const maxTimeMoment = moment(maxTime)
        if (timeToCheck.isAfter(maxTimeMoment, 'minute')) return true
      }

      return false
    },
    [minTime, maxTime, internalValue],
  )

  const yearOptions = useMemo(() => {
    const currentJalaliYear = moment().jYear()
    return Array.from({ length: 101 }, (_, i) => currentJalaliYear - 50 + i)
  }, [])

  const fieldWrapperClasses = [
    'field-type',
    'date-time-field',
    readOnly && 'read-only',
    showError && 'date-time-field--has-error',
  ]
    .filter(Boolean)
    .join(' ')

  const pickerClasses = [
    baseClass,
    `${baseClass}__appearance--${pickerAppearance}`,
    monthsToShow > 1 && `${baseClass}--multiple-months`,
    isDisabledState && `${baseClass}--disabled`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={fieldWrapperClasses} dir={isRtl ? 'rtl' : 'ltr'}>
      {showLabel && label && <FieldLabel label={label} path={path} required={required} />}
      <div className="field-type__wrap" id={path ? `field-${path}` : undefined}>
        {showError && errorMessage && <FieldError message={errorMessage} />}
        <div className={pickerClasses} id={id}>
          <div className={`${baseClass}__icon-wrap`}>
            {internalValue && !isDisabledState && (
              <button className={`${baseClass}__clear-button`} onClick={handleClear} type="button">
                <XIcon />
              </button>
            )}
            <CalendarIcon />
          </div>
          <div className={`${baseClass}__input-wrapper`} style={{ position: 'relative' }}>
            <div className="react-datepicker-wrapper">
              <div className="react-datepicker__input-container">
                <input
                  ref={overrides?.customInputRef || inputRef}
                  type="text"
                  value={displayValue}
                  onClick={() => !isDisabledState && !isOpen && setIsOpen(true)}
                  onChange={() => {}}
                  readOnly
                  disabled={isDisabledState}
                  placeholder={placeholderText || placeholder}
                  style={{ fontSize: i18n.language === 'fa' ? '16px' : '15px' }}
                />
              </div>
            </div>
            {isOpen && !isDisabledState && (
              <div
                className="react-datepicker-popper"
                ref={popperRef}
                style={{
                  position: 'absolute',
                  ...(popperPlacement === 'top'
                    ? { bottom: 'calc(100% + 10px)' }
                    : { top: 'calc(100% + 10px)' }),
                  ...(isRtl ? { right: 0 } : { left: 0 }),
                }}
              >
                <div className="react-datepicker" role="dialog" style={{ fontSize: '15px' }}>
                  {pickerAppearance !== 'timeOnly' && (
                    <>
                      <button
                        type="button"
                        className="react-datepicker__navigation react-datepicker__navigation--previous"
                        onClick={() => navigateMonth(-1)}
                      />
                      <button
                        type="button"
                        className="react-datepicker__navigation react-datepicker__navigation--next"
                        onClick={() => navigateMonth(1)}
                      />
                    </>
                  )}
                  {pickerAppearance !== 'timeOnly' && (
                    <div className="react-datepicker__month-container">
                      <div
                        className={`react-datepicker__header ${
                          pickerAppearance === 'dayAndTime'
                            ? 'react-datepicker__header--has-time-select'
                            : ''
                        }`}
                      >
                        <h2
                          className="react-datepicker__current-month"
                          style={{
                            fontSize: i18n.language === 'fa' ? '18px' : '16px',
                            fontWeight: 'bold',
                          }}
                        >
                          {i18n.language === 'fa'
                            ? `${monthNames[currentMonth - 1]} ${toPersianDigits(currentYear)}`
                            : `${monthNames[currentMonth - 1]} ${currentYear}`}
                        </h2>
                        <div
                          className="react-datepicker__header__dropdown react-datepicker__header__dropdown--select"
                          style={{ direction: 'ltr' }}
                        >
                          <select
                            className="react-datepicker__month-select"
                            value={currentMonth - 1}
                            onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10) + 1)}
                            style={{ fontSize: '14px' }}
                          >
                            {monthNames.map((month, index) => (
                              <option key={index} value={index}>
                                {month}
                              </option>
                            ))}
                          </select>
                          <select
                            className="react-datepicker__year-select"
                            value={currentYear}
                            onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                            style={{ fontSize: '14px' }}
                          >
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {i18n.language === 'fa' ? toPersianDigits(year) : year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="react-datepicker__day-names">
                          {weekDayNames.map((day, index) => (
                            <div
                              key={`weekday-${index}`}
                              className="react-datepicker__day-name"
                              style={{ fontSize: i18n.language === 'fa' ? '15px' : '14px' }}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="react-datepicker__month" role="listbox">
                        {Array.from({ length: Math.ceil(calendarGrid.length / 7) }).map(
                          (_, weekIndex) => (
                            <div key={weekIndex} className="react-datepicker__week">
                              {calendarGrid
                                .slice(weekIndex * 7, weekIndex * 7 + 7)
                                .map(({ day, month, year, isOutsideMonth }) => {
                                  const dayIsSelected = isSelected(year, month, day)
                                  const dayIsDisabled = isDisabled(year, month, day)
                                  const dayClasses = [
                                    'react-datepicker__day',
                                    dayIsSelected && 'react-datepicker__day--selected',
                                    isToday(year, month, day) && 'react-datepicker__day--today',
                                    dayIsDisabled && 'react-datepicker__day--disabled',
                                    isOutsideMonth && 'react-datepicker__day--outside-month',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')

                                  return (
                                    <div
                                      key={`${year}-${month}-${day}`}
                                      className={dayClasses}
                                      role="option"
                                      aria-selected={!!dayIsSelected}
                                      aria-disabled={!!dayIsDisabled}
                                      onClick={() =>
                                        !dayIsDisabled && handleDateSelect(year, month, day)
                                      }
                                      style={{ fontSize: i18n.language === 'fa' ? '15px' : '14px' }}
                                    >
                                      {i18n.language === 'fa' ? toPersianDigits(day) : day}
                                    </div>
                                  )
                                })}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {pickerAppearance === 'dayAndTime' && (
                    <div className="react-datepicker__time-container">
                      <div className="react-datepicker__header react-datepicker__header--time">
                        <div
                          className="react-datepicker-time__header"
                          style={{
                            fontSize: i18n.language === 'fa' ? '15px' : '14px',
                          }}
                        >
                          {timeLabel}
                        </div>
                      </div>
                      <div className="react-datepicker__time">
                        <div className="react-datepicker__time-box">
                          <ul className="react-datepicker__time-list" ref={timeListRef}>
                            {timeList.map(({ hour, minute }) => {
                              const isSelectedTime =
                                hour === selectedHour && minute === selectedMinute
                              const isTimeDisabledValue = isTimeDisabled(hour, minute)

                              return (
                                <li
                                  key={`${hour}:${minute}`}
                                  className={`react-datepicker__time-list-item ${
                                    isSelectedTime
                                      ? 'react-datepicker__time-list-item--selected'
                                      : ''
                                  } ${
                                    isTimeDisabledValue
                                      ? 'react-datepicker__time-list-item--disabled'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    !isTimeDisabledValue && handleTimeSelect(hour, minute)
                                  }
                                  style={{
                                    fontSize: i18n.language === 'fa' ? '14px' : '13px',
                                    opacity: isTimeDisabledValue ? 0.5 : 1,
                                    cursor: isTimeDisabledValue ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  {formatTime12Hour(hour, minute)}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  {pickerAppearance === 'timeOnly' && (
                    <div className="react-datepicker__time-container">
                      <div className="react-datepicker__header react-datepicker__header--time">
                        <div
                          className="react-datepicker-time__header"
                          style={{
                            fontSize: i18n.language === 'fa' ? '15px' : '14px',
                          }}
                        >
                          {timeLabel}
                        </div>
                      </div>
                      <div className="react-datepicker__time">
                        <div className="react-datepicker__time-box">
                          <ul className="react-datepicker__time-list" ref={timeListRef}>
                            {timeList.map(({ hour, minute }) => {
                              const isSelectedTime =
                                hour === selectedHour && minute === selectedMinute
                              const isTimeDisabledValue = isTimeDisabled(hour, minute)

                              return (
                                <li
                                  key={`${hour}:${minute}`}
                                  className={`react-datepicker__time-list-item ${
                                    isSelectedTime
                                      ? 'react-datepicker__time-list-item--selected'
                                      : ''
                                  } ${
                                    isTimeDisabledValue
                                      ? 'react-datepicker__time-list-item--disabled'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    !isTimeDisabledValue && handleTimeSelect(hour, minute)
                                  }
                                  style={{
                                    fontSize: i18n.language === 'fa' ? '14px' : '13px',
                                    opacity: isTimeDisabledValue ? 0.5 : 1,
                                    cursor: isTimeDisabledValue ? 'not-allowed' : 'pointer',
                                  }}
                                >
                                  {formatTime12Hour(hour, minute)}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersianDatePicker
