import React from 'react'
import { Metadata } from 'next'
import ContactPageClient from './page.client'

export const metadata: Metadata = {
  title: 'تماس با ما | حصارک پنجشیر - برای پشتیبانی در تماس باشید',
  description:
    'برای کمک در تکت، پشتیبانی مشتری، یا هرگونه سوال در مورد خدمات سفر بس ما در سراسر افغانستان با حصارک پنجشیر تماس بگیرید. ما 24/7 در خدمت شما هستیم.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
