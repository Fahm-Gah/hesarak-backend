'use client'

import { Toaster } from 'react-hot-toast'

export const Toast = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
          border: '1px solid rgba(254, 178, 178, 0.5)',
          borderRadius: '16px',
          color: '#c53030',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(8px)',
        },
        success: {
          style: {
            background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
            border: '1px solid rgba(72, 187, 120, 0.5)',
            color: '#2f855a',
          },
          iconTheme: {
            primary: '#38a169',
            secondary: '#f0fff4',
          },
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
            border: '1px solid rgba(254, 178, 178, 0.5)',
            color: '#c53030',
          },
          iconTheme: {
            primary: '#e53e3e',
            secondary: '#fff5f5',
          },
        },
        loading: {
          style: {
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            border: '1px solid rgba(251, 146, 60, 0.5)',
            color: '#c05621',
          },
          iconTheme: {
            primary: '#ea580c',
            secondary: '#fff7ed',
          },
        },
      }}
    />
  )
}
