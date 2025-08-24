import React from 'react'
import Script from 'next/script'

interface OrganizationStructuredDataProps {
  name: string
  url: string
  logo: string
  description: string
  telephone?: string
  email?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    addressCountry: string
  }
}

export const OrganizationStructuredData: React.FC<OrganizationStructuredDataProps> = ({
  name,
  url,
  logo,
  description,
  telephone,
  email,
  address,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    sameAs: [
      // Add social media links here if available
    ],
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface WebsiteStructuredDataProps {
  name: string
  url: string
  description: string
  potentialAction?: {
    target: string
    queryInput: string
  }
}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = ({
  name,
  url,
  description,
  potentialAction,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    inLanguage: 'fa',
    ...(potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: potentialAction.target,
        },
        'query-input': `required name=${potentialAction.queryInput}`,
      },
    }),
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export const BreadcrumbStructuredData: React.FC<BreadcrumbStructuredDataProps> = ({ items }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ServiceStructuredDataProps {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  areaServed: string
  serviceType: string
  url: string
}

export const ServiceStructuredData: React.FC<ServiceStructuredDataProps> = ({
  name,
  description,
  provider,
  areaServed,
  serviceType,
  url,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      url: provider.url,
    },
    areaServed: {
      '@type': 'Place',
      name: areaServed,
    },
    serviceType,
    url,
    inLanguage: 'fa',
  }

  return (
    <Script
      id="service-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export const FAQStructuredData: React.FC<FAQStructuredDataProps> = ({ faqs }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
