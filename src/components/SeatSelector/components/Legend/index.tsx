import React, { memo, useMemo } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { getOptimizedTranslations } from '../../utils'
import './index.scss'

export const Legend = memo(() => {
  const lang = useLanguage()
  const t = useMemo(() => getOptimizedTranslations(lang), [lang])

  const statuses = ['available', 'selected', 'booked', 'unpaid'] as const

  return (
    <div className="legend" role="list" aria-label={t.labels.seatStatusLegend}>
      {statuses.map((status) => (
        <div key={status} className="legend__item" role="listitem">
          <div className={`legend__box legend__box--${status}`} aria-hidden="true" />
          <span>{t.statuses[status]}</span>
        </div>
      ))}
    </div>
  )
})

Legend.displayName = 'Legend'
