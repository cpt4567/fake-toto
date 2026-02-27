'use client'

import { useEffect } from 'react'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    default: 'bg-toto-primary hover:bg-toto-primary-hover',
    success: 'bg-toto-success hover:bg-toto-success/90',
    danger: 'bg-toto-danger hover:bg-toto-danger/90',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default border-none"
        onClick={onClose}
        aria-label="닫기"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-800 border border-slate-600 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-700/50 hover:bg-slate-600/70 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-colors ${variantStyles[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
