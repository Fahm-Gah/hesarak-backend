import { useState, useEffect } from 'react'

export const useLanguage = (): 'en' | 'fa' => {
  const [language, setLanguage] = useState<'en' | 'fa'>('en')

  useEffect(() => {
    const docLang = document.documentElement.lang
    if (docLang && (docLang.includes('fa') || docLang.includes('per'))) {
      setLanguage('fa')
    } else {
      const payloadLang = localStorage.getItem('payload-language')
      if (payloadLang === 'fa') {
        setLanguage('fa')
      }
    }
  }, [])

  return language
}
