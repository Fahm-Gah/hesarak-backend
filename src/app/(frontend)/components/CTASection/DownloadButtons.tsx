'use client'

import React from 'react'

export const AppStoreButton = ({
  className = '',
  onClick,
}: {
  className?: string
  onClick?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={`bg-black text-white px-4 py-2.5 rounded-lg flex items-center hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg ${className}`}
    >
      <div className="flex items-center">
        <svg
          className="w-6 h-6 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
            fill="currentColor"
          />
        </svg>
        <div className="text-left">
          <div className="text-xs opacity-75 leading-tight">Download on the</div>
          <div className="text-sm font-bold leading-tight">App Store</div>
        </div>
      </div>
    </button>
  )
}

export const GooglePlayButton = ({
  className = '',
  onClick,
}: {
  className?: string
  onClick?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={`bg-black text-white px-4 py-2.5 rounded-lg flex items-center hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg ${className}`}
    >
      <div className="flex items-center">
        <svg
          className="w-6 h-6 mr-2"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.635 28.547L20.292 15.818L7.843 3.299C7.347 3.617 7 4.167 7 4.834V27.166C7 27.735 7.252 28.219 7.635 28.547Z"
            fill="url(#paint0_linear_gp)"
          />
          <path
            d="M30.048 14.4C31.317 15.099 31.317 16.901 30.048 17.6L24.929 20.417L20.292 15.818L24.692 11.453L30.048 14.4Z"
            fill="url(#paint1_linear_gp)"
          />
          <path
            d="M24.929 20.417L20.292 15.818L7.635 28.547C8.191 29.023 9.024 29.169 9.756 28.766L24.929 20.417Z"
            fill="url(#paint2_linear_gp)"
          />
          <path
            d="M7.843 3.299L20.292 15.818L24.692 11.453L9.756 3.234C9.11 2.879 8.386 2.95 7.843 3.299Z"
            fill="url(#paint3_linear_gp)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_gp"
              x1="15.677"
              y1="10.874"
              x2="7.071"
              y2="19.551"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#00C3FF" />
              <stop offset="1" stopColor="#1BE2FA" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_gp"
              x1="20.292"
              y1="15.818"
              x2="31.738"
              y2="15.818"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFCE00" />
              <stop offset="1" stopColor="#FFEA00" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_gp"
              x1="7.369"
              y1="30.1"
              x2="22.595"
              y2="17.894"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#DE2453" />
              <stop offset="1" stopColor="#FE3944" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_gp"
              x1="8.107"
              y1="1.901"
              x2="22.597"
              y2="13.737"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#11D574" />
              <stop offset="1" stopColor="#01F176" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-left">
          <div className="text-xs opacity-75 leading-tight">Get it on</div>
          <div className="text-sm font-bold leading-tight">Google Play</div>
        </div>
      </div>
    </button>
  )
}
