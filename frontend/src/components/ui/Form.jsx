import { forwardRef } from 'react'

export function FormField({ label, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export const Input = forwardRef(function Input({ error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`input ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`input ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
      {...props}
    >
      {children}
    </select>
  )
})

export const Textarea = forwardRef(function Textarea({ error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={3}
      className={`input resize-none ${error ? 'border-red-400' : ''}`}
      {...props}
    />
  )
})
