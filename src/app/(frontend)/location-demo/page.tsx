import { Metadata } from 'next'
import { LocationDemoClient } from './page.client'
import './page.scss'

export const metadata: Metadata = {
  title: 'Location Capture System | Demo',
  description:
    'Test and debug location capture functionality with browser GPS and IP geolocation fallback.',
  keywords: ['location', 'GPS', 'geolocation', 'IP', 'demo', 'testing'],
  robots: {
    index: false, // Don't index demo pages
    follow: false,
  },
}

/**
 * Server Component for Location Demo Page
 *
 * This component handles:
 * - SEO metadata
 * - Static page structure
 * - CSS imports
 * - Initial page load optimization
 */
export default function LocationDemoPage() {
  return (
    <div className="location-demo">
      <div className="location-demo__container">
        <div className="location-demo__content">
          {/* Static Header - Rendered on Server */}
          <header className="location-demo__header">
            <h1 className="location-demo__title">🌍 Location Capture System</h1>
            <p className="location-demo__subtitle">Test and debug location capture functionality</p>
          </header>

          {/* Client Component - Handles all interactive functionality */}
          <LocationDemoClient />

          {/* Static Instructions - Rendered on Server */}
          <section className="location-demo__section">
            <div className="location-demo__info">
              <h3 className="location-demo__info-title">ℹ️ How it works</h3>
              <ul className="location-demo__info-list">
                <li>
                  <strong>HTTPS Context:</strong> Requests browser geolocation permission
                </li>
                <li>
                  <strong>HTTP or Denied:</strong> Automatically falls back to IP-based geolocation
                </li>
                <li>
                  <strong>Caching:</strong> Location is cached for 5 minutes to reduce API calls
                </li>
                <li>
                  <strong>Server Updates:</strong> Location data is sent to server and stored in
                  user profile
                </li>
                <li>
                  <strong>History:</strong> System maintains the last 10 location entries for
                  auditing
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
