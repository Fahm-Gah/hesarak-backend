'use client'
import React, { lazy, Suspense } from 'react'
import { ShimmerEffect } from '@payloadcms/ui'
import type { Props } from './types'

import './index.scss'

const ProfileSelector = lazy(() => import('./ProfileSelector.js'))

export const ProfileSelectorField: React.FC<Props> = (props) => {
  // Simple language detection for fallback
  const isRTL =
    typeof window !== 'undefined' &&
    (localStorage.getItem('payload-language') === 'fa' ||
      document.documentElement.lang?.includes('fa'))

  return (
    <Suspense
      fallback={
        <div className="field-type-relationship" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="field-type-relationship__label">
            <label className="field-label">
              {typeof props.field.label === 'string'
                ? props.field.label
                : props.field.label?.fa || props.field.label?.en || 'Profile'}
              {props.field.required && <span className="required">*</span>}
            </label>
          </div>
          <ShimmerEffect height={40} />
        </div>
      }
    >
      <ProfileSelector {...props} />
    </Suspense>
  )
}

export { ProfileSelector }
export default ProfileSelectorField
