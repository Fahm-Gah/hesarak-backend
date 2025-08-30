'use client'

import React, { lazy, Suspense } from 'react'
import { ShimmerEffect, FieldLabel } from '@payloadcms/ui'
import type { Props } from './types'

import './index.scss'

// Lazy load the actual component
const ProfileSelectorComponent = lazy(() => import('./Component'))

export const ProfileSelectorField: React.FC<Props> = (props) => {
  const { field, path } = props

  // Simple language detection for fallback shimmer
  const isRTL =
    typeof window !== 'undefined' &&
    (localStorage.getItem('payload-language') === 'fa' ||
      document.documentElement.lang?.includes('fa'))

  return (
    <Suspense
      fallback={
        <div
          className={`field-type relationship ${field.admin?.allowCreate ? 'relationship--allow-create' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <FieldLabel
            htmlFor={path}
            label={typeof field.label === 'function' ? undefined : field.label || undefined}
            required={field.required}
          />
          <div className="field-type__wrap">
            <div className="relationship__wrap">
              <div className="rs__control">
                <ShimmerEffect height="auto" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProfileSelectorComponent {...props} />
    </Suspense>
  )
}

export default ProfileSelectorField
