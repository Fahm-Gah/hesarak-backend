import React from 'react'

import config from '@/payload.config'

export default async function HomePage() {
  const payloadConfig = await config

  return <div className="home"></div>
}
