const variants = {
  pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  pagado:    'bg-green-100  text-green-800  border border-green-200',
  vencido:   'bg-red-100    text-red-800    border border-red-200',
  abierto:   'bg-blue-100   text-blue-800   border border-blue-200',
  cerrado:   'bg-gray-100   text-gray-600   border border-gray-200',
  activo:    'bg-green-100  text-green-800  border border-green-200',
  inactivo:  'bg-gray-100   text-gray-600   border border-gray-200',
}

export default function Badge({ value, label }) {
  const key = typeof value === 'boolean' ? (value ? 'activo' : 'inactivo') : value
  const cls = variants[key] ?? 'bg-gray-100 text-gray-600 border border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label ?? key}
    </span>
  )
}
