'use client'

import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onDismiss, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  const typeStyles = {
    success: 'bg-toto-success text-white shadow-toto-success',
    error: 'bg-toto-danger text-white',
    info: 'bg-toto-primary text-white',
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        px-6 py-4 rounded-xl font-medium
        animate-slide-up
        ${typeStyles[type]}
      `}
    >
      {message}
    </div>
  )
}
