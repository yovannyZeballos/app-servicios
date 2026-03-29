import { Loader2 } from 'lucide-react'

export default function Spinner({ className = 'h-8 w-8' }) {
  return <Loader2 className={`animate-spin text-indigo-600 ${className}`} />
}
