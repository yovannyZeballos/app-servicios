import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Tag,
  CreditCard,
  Zap,
  BarChart3,
  Users,
  Layers,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const nav = [
    { to: '/dashboard', label: 'Dashboard',         Icon: LayoutDashboard },
    { to: '/conceptos', label: 'Conceptos',         Icon: Tag },
    { to: '/pagos',     label: 'Mis Pagos',         Icon: CreditCard },
    { to: '/plantilla', label: 'Plantilla mensual', Icon: Zap },
    { to: '/reporte',   label: 'Reporte',           Icon: BarChart3 },
    ...(user?.rol === 'principal'
      ? [{ to: '/tipos-pago', label: 'Tipos de Pago', Icon: Layers }]
      : []),
    ...(user?.rol === 'principal'
      ? [{ to: '/usuarios', label: 'Usuarios', Icon: Users }]
      : []),
  ]

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-indigo-900 text-white flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
      `}
    >
      <div className="px-6 py-5 border-b border-indigo-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">App Servicios</h1>
          <p className="text-indigo-300 text-xs mt-0.5">Gestión de pagos mensuales</p>
        </div>
        <button
          className="lg:hidden p-1 rounded text-indigo-300 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-indigo-800 text-indigo-400 text-xs">
        v2.0.0 · Node 24.3.0
      </div>
    </aside>
  )
}
