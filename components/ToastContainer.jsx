'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { useEffect } from 'react'

export default function ToastContainer() {
  const { toasts, removeToast } = useStore()

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 3000)
    return () => clearTimeout(timer)
  }, [onDismiss, toast.duration])

  const variants = {
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    error: 'bg-rose-500 text-white shadow-lg shadow-rose-500/30',
    info: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`px-6 py-4 rounded-xl font-medium pointer-events-auto ${variants[toast.type] ?? variants.info}`}
    >
      {toast.message}
    </motion.div>
  )
}
