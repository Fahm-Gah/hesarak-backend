import React from 'react'
import { Metadata } from 'next'
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Hesaarak - Your Data Protection',
  description:
    'Learn how Hesaarak protects your personal information and handles your data with transparency and security.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Privacy <span className="text-orange-500">Policy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect
              your personal information.
            </p>
            <p className="text-sm text-gray-400 mt-4">Last updated: December 2024</p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Privacy Principles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to protecting your privacy and being transparent about how we handle
              your data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Data Protection',
                description:
                  'We use industry-standard security measures to protect your personal information.',
              },
              {
                icon: Eye,
                title: 'Transparency',
                description: 'We are clear about what data we collect and how we use it.',
              },
              {
                icon: Lock,
                title: 'Secure Storage',
                description: 'Your data is encrypted and stored securely on protected servers.',
              },
              {
                icon: UserCheck,
                title: 'User Control',
                description:
                  'You have control over your personal data and can request changes or deletion.',
              },
              {
                icon: Database,
                title: 'Minimal Collection',
                description: 'We only collect data that is necessary for providing our services.',
              },
              {
                icon: Globe,
                title: 'No Third-Party Sales',
                description: 'We never sell your personal information to third parties.',
              },
            ].map((principle, index) => {
              const IconComponent = principle.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 text-center"
                >
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{principle.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{principle.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Privacy Policy</h2>

            <div className="space-y-8">
              {/* Information We Collect */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Information We Collect
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Full name and contact details</li>
                      <li>Phone number for account creation and booking confirmation</li>
                      <li>Email address for communications</li>
                      <li>Location data (if you grant permission) to improve our services</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Booking Information</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Trip details and seat preferences</li>
                      <li>
                        Payment information (processed securely through third-party processors)
                      </li>
                      <li>Travel history and booking patterns</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      Technical Information
                    </h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Device information and browser type</li>
                      <li>IP address and approximate location</li>
                      <li>Usage patterns and preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. How We Use Your Information
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>We use your personal information for the following purposes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Service Provision:</strong> To process bookings, manage reservations,
                      and provide customer support
                    </li>
                    <li>
                      <strong>Communication:</strong> To send booking confirmations, trip updates,
                      and important notifications
                    </li>
                    <li>
                      <strong>Improvement:</strong> To analyze usage patterns and improve our
                      services
                    </li>
                    <li>
                      <strong>Safety:</strong> To ensure passenger safety and security during travel
                    </li>
                    <li>
                      <strong>Legal Compliance:</strong> To comply with applicable laws and
                      regulations
                    </li>
                  </ul>
                </div>
              </div>

              {/* Information Sharing */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Information Sharing and Disclosure
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>We may share your information in the following limited circumstances:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Service Providers:</strong> With trusted third-party service providers
                      who help us operate our platform
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law, court order, or
                      government regulations
                    </li>
                    <li>
                      <strong>Safety and Security:</strong> To protect the rights, property, or
                      safety of Hesaarak, our users, or others
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In connection with a merger, acquisition,
                      or sale of assets
                    </li>
                  </ul>
                  <p>
                    <strong>
                      We never sell your personal information to third parties for marketing
                      purposes.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h3>
                <div className="space-y-2 text-gray-700">
                  <p>We implement robust security measures to protect your personal information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Encryption of sensitive data both in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Secure payment processing through certified providers</li>
                    <li>Regular employee training on data protection</li>
                  </ul>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Your Rights and Choices
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>You have the following rights regarding your personal information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Access:</strong> Request a copy of the personal information we hold
                      about you
                    </li>
                    <li>
                      <strong>Correction:</strong> Request correction of inaccurate or incomplete
                      information
                    </li>
                    <li>
                      <strong>Deletion:</strong> Request deletion of your personal information
                      (subject to legal requirements)
                    </li>
                    <li>
                      <strong>Portability:</strong> Request transfer of your data to another service
                      provider
                    </li>
                    <li>
                      <strong>Opt-out:</strong> Unsubscribe from marketing communications at any
                      time
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us at{' '}
                    <a
                      href="mailto:privacy@hesaarak.com"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      privacy@hesaarak.com
                    </a>
                  </p>
                </div>
              </div>

              {/* Cookies and Tracking */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Cookies and Tracking Technologies
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze website traffic and usage patterns</li>
                    <li>Improve website functionality and user experience</li>
                    <li>Provide personalized content and advertisements</li>
                  </ul>
                  <p>You can control cookie settings through your browser preferences.</p>
                </div>
              </div>

              {/* Data Retention */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h3>
                <div className="space-y-2 text-gray-700">
                  <p>We retain your personal information for as long as necessary to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide our services and support your account</li>
                    <li>Comply with legal obligations and resolve disputes</li>
                    <li>Prevent fraud and ensure platform security</li>
                  </ul>
                  <p>We will securely delete or anonymize your data when it is no longer needed.</p>
                </div>
              </div>

              {/* Updates to Policy */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Updates to This Policy
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>We may update this privacy policy from time to time. When we make changes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>We will post the updated policy on our website</li>
                    <li>We will update the "Last modified" date</li>
                    <li>
                      For significant changes, we will notify you via email or app notification
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    If you have questions about this privacy policy or our data practices, please
                    contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <ul className="space-y-2">
                      <li>
                        <strong>Email:</strong>{' '}
                        <a
                          href="mailto:privacy@hesaarak.com"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          privacy@hesaarak.com
                        </a>
                      </li>
                      <li>
                        <strong>Phone:</strong> +93 70 123 4567
                      </li>
                      <li>
                        <strong>Address:</strong> Shar-e-Naw, Kabul, Afghanistan
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
