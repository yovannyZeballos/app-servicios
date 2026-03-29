import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, BarChart3 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { reporteApi } from '../api/reporte.js'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const anioActual = new Date().getFullYear()
const ANIOS = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i)

export default function Reporte() {
  const { user } = useAuth()
  const [anio, setAnio] = useState(String(anioActual))
  const [mes,  setMes]  = useState(String(new Date().getMonth() + 1))

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['reporte-detalle', anio, mes],
    queryFn: () => reporteApi.detalle({
      ...(anio ? { anio } : {}),
      ...(mes  ? { mes  } : {}),
    }),
  })

  const { data: resumenData } = useQuery({
    queryKey: ['reporte-resumen', anio],
    queryFn: () => reporteApi.resumen({ ...(anio ? { anio } : {}) }),
  })

  const pagos   = data?.data?.data       ?? []
  const resumen = resumenData?.data?.data ?? []

  const pagados       = pagos.filter((p) => p.estado === 'pagado')
  const pendientes     = pagos.filter((p) => p.estado === 'pendiente')
  const montoPagado    = pagados.reduce((acc, p)   => acc + Number(p.monto), 0)
  const montoPendiente = pendientes.reduce((acc, p) => acc + Number(p.monto), 0)

  const chartData = anio
    ? Array.from({ length: 12 }, (_, i) => {
        const r = resumen.find((x) => Number(x.mes) === i + 1)
        return {
          mes: MESES_CORTOS[i],
          Pagado:    r ? Number(r.monto_pagado)    : 0,
          Pendiente: r ? Number(r.monto_pendiente) : 0,
        }
      })
    : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" /> Reporte de pagos
        </h1>
        <p className="text-gray-500 mt-1">Servicios pagados por período</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-200 flex-wrap">
        <Filter className="h-5 w-5 text-gray-400 self-center shrink-0" />
        <div className="flex flex-col">
          <label className="label">Año</label>
          <select className="input !w-28" value={anio} onChange={(e) => setAnio(e.target.value)}>
            <option value="">Todos</option>
            {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="label">Mes</label>
          <select className="input !w-36" value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Gráfico de barras por mes */}
      {anio && chartData.some((d) => d.Pagado > 0 || d.Pendiente > 0) && (
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Montos por mes — {anio}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `S/${v.toLocaleString()}`}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [`S/ ${Number(value).toFixed(2)}`, name]}
              />
              <Legend />
              <Bar dataKey="Pagado"    fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pendiente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Resumen por período (solo cuando se filtra por año sin mes) */}
      {anio && !mes && resumen.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Resumen por mes — {anio}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumen.map((r) => (
              <div key={`${r.anio}-${r.mes}`} className="card">
                <p className="text-sm font-medium text-gray-500">{MESES[r.mes - 1]} {r.anio}</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  S/ {Number(r.monto_pagado).toFixed(2)}
                </p>
                <p className="text-xs text-indigo-500 font-medium">
                  Pendiente: S/ {Number(r.monto_pendiente).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.total_pagados} pagado{Number(r.total_pagados) !== 1 ? 's' : ''}
                  {Number(r.total_pendientes) > 0 && ` · ${r.total_pendientes} pendiente${Number(r.total_pendientes) !== 1 ? 's' : ''}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totalizador */}
      {(anio || mes) && !isLoading && pagos.length > 0 && (
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">
            <p className="text-xs text-green-600 font-medium">Monto pagado</p>
            <p className="text-xl font-bold text-green-700">S/ {montoPagado.toFixed(2)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
            <p className="text-xs text-amber-600 font-medium">Monto pendiente</p>
            <p className="text-xl font-bold text-amber-700">S/ {montoPendiente.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-500 font-medium">Servicios pagados</p>
            <p className="text-xl font-bold text-gray-800">{pagados.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-500 font-medium">Servicios pendientes</p>
            <p className="text-xl font-bold text-gray-800">{pendientes.length}</p>
          </div>
        </div>
      )}

      {/* Tabla de detalle */}
      {isLoading || isFetching
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : pagos.length === 0
          ? <div className="card text-center py-12 text-gray-400">No hay pagos para el período seleccionado</div>
          : (
            <div className="card overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {user?.rol === 'admin' && <th className="text-left py-2 px-3 font-medium text-gray-600">Usuario</th>}
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Concepto</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Período</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Monto</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">F. Pago</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {user?.rol === 'admin' && <td className="py-2 px-3 text-gray-700">{p.usuario_nombre}</td>}
                      <td className="py-2 px-3 font-medium text-gray-900">{p.concepto_nombre}</td>
                      <td className="py-2 px-3 text-gray-700">{MESES[p.mes - 1]} {p.anio}</td>
                      <td className="py-2 px-3 font-semibold text-indigo-700">S/ {Number(p.monto).toFixed(2)}</td>
                      <td className="py-2 px-3 text-gray-600">{p.fecha_pago?.slice(0, 10) ?? '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.estado === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 max-w-xs truncate">{p.observaciones ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
    </div>
  )
}
