import { useQuery } from '@tanstack/react-query'
import { CreditCard, CheckCircle, Tag, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { pagosApi }    from '../api/pagos.js'
import { conceptosApi } from '../api/conceptos.js'
import Spinner from '../components/ui/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function StatCard({ label, value, Icon, color, to }) {
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const anioActual = new Date().getFullYear()
  const mesActual  = new Date().getMonth() + 1

  const { data: pagosData,    isLoading: lP  } = useQuery({ queryKey: ['pagos'],              queryFn: () => pagosApi.listar() })
  const { data: pendientesData, isLoading: lPe } = useQuery({ queryKey: ['pagos', '', '', '', 'pendiente'], queryFn: () => pagosApi.listar({ estado: 'pendiente' }) })
  const { data: conceptosData, isLoading: lC  } = useQuery({ queryKey: ['conceptos-activos'], queryFn: () => conceptosApi.listar({ activo: true }) })

  const isLoading = lP || lPe || lC

  const pagos      = pagosData?.data?.data      ?? []
  const pendientes = pendientesData?.data?.data ?? []
  const conceptos  = conceptosData?.data?.data  ?? []

  const totalMesActual = pagos
    .filter((p) => p.anio === anioActual && p.mes === mesActual)
    .reduce((acc, p) => acc + Number(p.monto), 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido, {user?.nombre}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <StatCard label="Conceptos activos"  value={conceptos.length}  Icon={Tag}         color="bg-indigo-500" to="/conceptos" />
          <StatCard label="Mis pagos (total)"   value={pagos.length}      Icon={CreditCard}  color="bg-cyan-500"   to="/pagos" />
          <StatCard label="Pendientes"          value={pendientes.length} Icon={FileText}    color="bg-amber-500"  to="/pagos?estado=pendiente" />
          <StatCard label={`Pagado ${MESES[mesActual-1]} ${anioActual}`}
                    value={`S/ ${totalMesActual.toFixed(2)}`}
                    Icon={CheckCircle}
                    color="bg-green-500"
                    to={`/pagos`} />
        </div>
      )}

      {/* Pagos recientes */}
      {!lP && pagos.length > 0 && (
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pagos recientes</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-4">Concepto</th>
                <th className="pb-2 pr-4">Período</th>
                <th className="pb-2 pr-4">Monto</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">{p.concepto_nombre}</td>
                  <td className="py-2 pr-4 text-gray-600">{MESES[p.mes - 1]} {p.anio}</td>
                  <td className="py-2 pr-4 font-semibold text-gray-900">S/ {Number(p.monto).toFixed(2)}</td>
                  <td className="py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
