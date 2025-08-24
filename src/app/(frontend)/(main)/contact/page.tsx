import React from 'react'
import { Metadata } from 'next'
import ContactPageClient from './ContactPage.client'
import { generateSEOMetadata } from '@/components/SEO/SEOHead'

export const metadata: Metadata = generateSEOMetadata({
  title: 'تماس با ما | حصارک‌بس - پشتیبانی ۲۴ ساعته',
  description:
    'برای کمک در بلیط، پشتیبانی مشتری، یا هرگونه سوال در مورد خدمات سفر اتوبوس در سراسر افغانستان با حصارک‌بس تماس بگیرید. پشتیبانی ۲۴/۷ در خدمت شما.',
  keywords:
    'تماس با ما, پشتیبانی, حصارک‌بس, ارتباط با ما, خدمات مشتری, پشتیبانی آنلاین, تماس پشتیبانی, اتوبوس پنجشیر, خدمات سفر',
  url: '/contact',
  type: 'website',
})

export default function ContactPage() {
  return <ContactPageClient />
}
