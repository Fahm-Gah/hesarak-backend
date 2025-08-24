import React from 'react'
import Script from 'next/script'

// Performance and Core Web Vitals optimizations
export const PerformanceOptimizations: React.FC = () => {
  return (
    <>
      {/* Preload critical resources */}
      <link rel="preload" href="/images/logo.png" as="image" type="image/png" />
      <link rel="preload" href="/favicon/favicon-32x32.png" as="image" type="image/png" />

      {/* DNS prefetch for external services */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//vercel.live" />

      {/* Preconnect to critical external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Resource hints for better loading */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="date=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="email=no" />

      {/* Critical CSS hint */}
      <meta name="critical-resource" content="styles" />

      {/* Web Vitals tracking script */}
      <Script
        id="web-vitals"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Basic Web Vitals tracking
              function sendToAnalytics(name, value, id) {
                // Send to your analytics service
                console.log('Web Vital:', name, value, id);
                // You can replace this with your analytics service
                if (typeof gtag !== 'undefined') {
                  gtag('event', name, {
                    event_category: 'Web Vitals',
                    event_label: id,
                    value: Math.round(name === 'CLS' ? value * 1000 : value),
                    non_interaction: true,
                  });
                }
              }

              // Import and use the web-vitals library
              if ('web-vitals' in window) {
                getCLS(sendToAnalytics);
                getFID(sendToAnalytics);
                getFCP(sendToAnalytics);
                getLCP(sendToAnalytics);
                getTTFB(sendToAnalytics);
              }
            })();
          `,
        }}
      />

      {/* Lazy loading hint for images */}
      <meta name="loading" content="lazy" />

      {/* HTTP/2 push hints */}
      <meta httpEquiv="Link" content="</images/logo.png>; rel=preload; as=image" />

      {/* Performance timing API hint */}
      <meta name="performance-timing" content="enabled" />

      {/* Service Worker registration hint */}
      <Script
        id="service-worker-hint"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // Register service worker for caching if available
                // navigator.serviceWorker.register('/sw.js');
              });
            }
          `,
        }}
      />
    </>
  )
}

// Google Analytics 4 with Persian language support
interface GoogleAnalyticsProps {
  measurementId?: string
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
}) => {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              language: 'fa',
              country: 'AF',
              currency: 'AFN',
              custom_map: {
                'custom_parameter_1': 'user_type',
                'custom_parameter_2': 'booking_stage'
              }
            });
            
            // Track RTL layout usage
            gtag('event', 'page_view', {
              event_category: 'Layout',
              event_label: 'RTL',
              custom_parameter_1: 'persian_user'
            });
          `,
        }}
      />
    </>
  )
}

// Microsoft Clarity for heatmaps and session recordings
interface MicrosoftClarityProps {
  projectId?: string
}

export const MicrosoftClarity: React.FC<MicrosoftClarityProps> = ({
  projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
}) => {
  if (!projectId) return null

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${projectId}");
          
          // Set custom tags for Persian website
          clarity("set", "language", "persian");
          clarity("set", "layout", "rtl");
          clarity("set", "market", "afghanistan");
        `,
      }}
    />
  )
}
