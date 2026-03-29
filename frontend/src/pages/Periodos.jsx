import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, RefreshCw, Lock } from 'lucide-react'
import { periodosApi } from '../api/periodos.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Select } from '../components/ui/Form.jsx'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const anioActual = new Date().getFullYear()

const schema = z.object({
  anio: z.coerce.number().min(2000).max(2100),
  mes:  z.coerce.number().min(1).max(12),
})

export default function Periodos() {
  const qc = useQueryClient()
  const [modalOpen,   setModalOpen]   = useState(false)
  const [cerrarItem,  setCerrarItem]  = useState(null)
  const [generarItem, setGenerarItem] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['periodos'], queryFn: () => periodosApi.listar() })
  const periodos = data?.data?.data ?? []

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const crearMutation = useMutation({
    mutationFn: (v) => periodosApi.crear(v),
    onSuccess: () => { toast.success('Periodo creado'); qc.invalidateQueries({ queryKey: ['periodos'] }); setModalOpen(false) },
  })

  const cerrarMutation = useMutation({
    mutationFn: (id) => periodosApi.cerrar(id),
    onSuccess: (res) => {
      toast.success(`Periodo cerrado · ${res.data.pagos_vencidos} pago(s) marcado(s) como vencidos`)
      qc.invalidateQueries({ queryKey: ['periodos'] })
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setCerrarItem(null)
    },
  })

  const generarMutation = useMutation({
    mutationFn: (id) => periodosApi.generarPagos(id),
    onSuccess: (res) => {
      toast.success(`${res.data.generados} pago(s) generados`)
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setGenerarItem(null)
    },
  })

  const columns = [
    { key: 'periodo',     header: 'Periodo',     render: (r) => `${MESES[r.mes-1]} ${r.anio}` },
    { key: 'fecha_inicio',header: 'Inicio',       render: (r) => r.fecha_inicio?.slice(0,10) },
    { key: 'fecha_fin',   header: 'Fin',          render: (r) => r.fecha_fin?.slice(0,10) },
    { key: 'estado',      header: 'Estado',       render: (r) => <Badge value={r.estado} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <button
            className="btn-secondary !py-1 !px-2 text-xs"
            onClick={() => setGenerarItem(r)}
            disabled={r.estado === 'cerrado'}
            title="Generar pagos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            className="btn-danger !py-1 !px-2 text-xs"
            onClick={() => setCerrarItem(r)}
            disabled={r.estado === 'cerrado'}
            title="Cerrar periodo"
          >
            <Lock className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Periodos</h1>
          <p className="text-gray-500 mt-1">Periodos mensuales de facturación</p>
        </div>
        <button className="btn-primary" onClick={() => { reset({ anio: anioActual, mes: new Date().getMonth() + 1 }); setModalOpen(true) }}>
          <Plus className="h-4 w-4" /> Nuevo periodo
        </button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={periodos} emptyText="No hay periodos registrados" />}

      {/* Modal crear periodo */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo periodo" size="sm">
        <form onSubmit={handleSubmit((v) => crearMutation.mutate(v))}>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Año *" error={errors.anio?.message}>
              <Select {...register('anio')}>
                {[anioActual - 1, anioActual, anioActual + 1].map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </FormField>
            <FormField label="Mes *" error={errors.mes?.message}>
              <Select {...register('mes')}>
                {MESES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={crearMutation.isPending}>
              {crearMutation.isPending ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmación cerrar */}
      <ConfirmDialog
        open={!!cerrarItem} onClose={() => setCerrarItem(null)}
        onConfirm={() => cerrarMutation.mutate(cerrarItem.id)}
        loading={cerrarMutation.isPending}
        title="Cerrar periodo"
        message={`¿Cerrar el periodo "${cerrarItem ? MESES[cerrarItem.mes-1] + ' ' + cerrarItem.anio : ''}"? Los pagos pendientes pasarán a vencidos.`}
      />

      {/* Confirmación generar pagos */}
      <ConfirmDialog
        open={!!generarItem} onClose={() => setGenerarItem(null)}
        onConfirm={() => generarMutation.mutate(generarItem.id)}
        loading={generarMutation.isPending}
        title="Generar pagos"
        message={`¿Generar cobros para todos los servicios activos en "${generarItem ? MESES[generarItem.mes-1] + ' ' + generarItem.anio : ''}"?`}
      />
    </div>
  )
}
