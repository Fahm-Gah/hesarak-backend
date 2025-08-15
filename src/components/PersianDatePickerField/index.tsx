'use client'
import React, { lazy, Suspense } from 'react'

import type { Props } from './types.js'

import { ShimmerEffect } from '@payloadcms/ui'

const PersianDatePicker = lazy(() => import('./PersianDatePicker.js'))

export const PersianDatePickerField: React.FC<Props> = (props) => (
  <Suspense fallback={<ShimmerEffect height={50} />}>
    <PersianDatePicker {...props} />
  </Suspense>
)

export { PersianDatePicker }
export default PersianDatePickerField
