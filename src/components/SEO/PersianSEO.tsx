import React from 'react'
import Script from 'next/script'

// Persian-specific SEO improvements
export const PersianSEOOptimizations: React.FC = () => {
  return (
    <>
      {/* Persian language and RTL support */}
      <meta name="language" content="Persian" />
      <meta name="content-language" content="fa" />
      <meta name="geo.region" content="AF" />
      <meta name="geo.country" content="Afghanistan" />
      <meta name="geo.placename" content="Panjshir, Afghanistan" />

      {/* Afghan/Persian market specific tags */}
      <meta name="dc.language" content="fa" />
      <meta name="dc.creator" content="حصارک‌بس" />
      <meta name="dc.publisher" content="حصارک‌بس" />

      {/* RTL-specific tags */}
      <meta name="direction" content="rtl" />

      {/* Afghan timezone and currency */}
      <meta name="geo.timezone" content="Asia/Kabul" />
      <meta name="currency" content="AFN" />

      {/* Persian keywords for better search */}
      <meta name="classification" content="سفر و گردشگری" />
      <meta name="category" content="حمل و نقل" />

      {/* Schema.org in Persian context */}
      <Script
        id="persian-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': 'https://hesarakbus.com/#localbusiness',
            name: 'حصارک‌بس',
            alternateName: 'Hesarak Bus',
            description: 'سیستم آنلاین رزرو بلیط اتوبوس پنجشیر، افغانستان',
            url: 'https://hesarakbus.com',
            telephone: '+93799004567',
            email: 'info@hesarakbus.com',
            priceRange: 'افقانی ۱۰۰-۲۰۰۰',
            paymentAccepted: ['نقد', 'کارت بانکی', 'پرداخت آنلاین'],
            currenciesAccepted: 'AFN',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'پنجشیر',
              addressRegion: 'پنجشیر',
              addressCountry: 'AF',
              addressCountryCode: 'AF',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 35.3584,
              longitude: 69.4072,
            },
            areaServed: [
              {
                '@type': 'Country',
                name: 'افغانستان',
              },
              {
                '@type': 'AdministrativeArea',
                name: 'پنجشیر',
              },
            ],
            serviceArea: {
              '@type': 'GeoCircle',
              geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 34.5553,
                longitude: 69.2075,
              },
              geoRadius: '500000', // 500km radius
            },
            hasMap: 'https://www.google.com/maps/place/Panjshir,+Afghanistan/',
            openingHours: ['Sa-Th 08:00-20:00'],
            inLanguage: 'fa',
            knowsLanguage: ['fa', 'prs', 'en'],
            parentOrganization: {
              '@type': 'Organization',
              name: 'حکومت محلی پنجشیر',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'پنجشیر',
                addressCountry: 'AF',
              },
            },
          }),
        }}
      />

      {/* Afghan/Persian specific service schema */}
      <Script
        id="afghan-transport-service"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'خدمات رزرو بلیط اتوبوس',
            description: 'رزرو آنلاین بلیط اتوبوس برای سفرهای بین شهری در افغانستان',
            provider: {
              '@type': 'Organization',
              name: 'حصارک‌بس',
            },
            areaServed: {
              '@type': 'Country',
              name: 'افغانستان',
            },
            availableChannel: {
              '@type': 'ServiceChannel',
              serviceUrl: 'https://hesarakbus.com',
              serviceName: 'وب‌سایت حصارک‌بس',
              availableLanguage: 'fa',
            },
            termsOfService: 'https://hesarakbus.com/terms',
            serviceType: 'حمل و نقل مسافری',
            serviceOutput: {
              '@type': 'Ticket',
              name: 'بلیط اتوبوس',
            },
            inLanguage: 'fa',
          }),
        }}
      />

      {/* Yandex verification for Russian/Central Asian market */}
      <meta name="yandex-verification" content={process.env.YANDEX_VERIFICATION || ''} />

      {/* Baidu verification for Chinese market (if relevant) */}
      <meta name="baidu-site-verification" content={process.env.BAIDU_VERIFICATION || ''} />
    </>
  )
}

// Persian-specific breadcrumb component
interface PersianBreadcrumbProps {
  items: Array<{
    name: string
    url: string
  }>
}

export const PersianBreadcrumb: React.FC<PersianBreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="مسیر صفحه" className="text-sm text-gray-500 mb-4" dir="rtl">
      <ol className="flex items-center space-x-reverse space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            <a
              href={item.url}
              className={`${
                index === items.length - 1
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
