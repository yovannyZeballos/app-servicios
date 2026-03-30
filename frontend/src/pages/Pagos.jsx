import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Filter, CheckCircle, Zap } from 'lucide-react'
import { pagosApi }     from '../api/pagos.js'
import { conceptosApi } from '../api/conceptos.js'
import { tiposPagoApi } from '../api/tipos_pago.js'
import Table          from '../components/ui/Table.jsx'
import Modal          from '../components/ui/Modal.jsx'
import ConfirmDialog  from '../components/ui/ConfirmDialog.jsx'
import Badge          from '../components/ui/Badge.jsx'
import Spinner        from '../components/ui/Spinner.jsx'
import { FormField, Input, Select, Textarea } from '../components/ui/Form.jsx'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const anioActual = new Date().getFullYear()
const ANIOS = Array.from({ length: 6 }, (_, i) => anioActual - 2 + i)
const hoy   = new Date().toISOString().slice(0, 10)

// ── Schemas ──────────────────────────────────────────────────
const schema = z.object({
  concepto_id:   z.coerce.number({ invalid_type_error: 'Selecciona un concepto' }).int().min(1, 'Requerido'),
  tipo_pago_id:  z.coerce.number().int().positive().optional().nullable(),
  anio:          z.coerce.number().int().min(2000).max(2100),
  mes:           z.coerce.number().int().min(1).max(12),
  monto:         z.coerce.number({ invalid_type_error: 'Debe ser un número' }).positive('Debe ser > 0'),
  es_pendiente:  z.boolean().optional().default(false),
  fecha_pago:    z.string().optional(),
  referencia:    z.string().max(100).optional(),
  observaciones: z.string().max(500).optional(),
}).superRefine((d, ctx) => {
  if (!d.es_pendiente && !d.fecha_pago) {
    ctx.addIssue({ code: 'custom', path: ['fecha_pago'], message: 'Requerido para pagos confirmados' })
  }
})

const schemaPagar = z.object({
  fecha_pago: z.string().min(1, 'Requerido'),
  referencia: z.string().max(100).optional(),
})

export default function Pagos() {
  const qc = useQueryClient()

  // ── Dialog state ─────────────────────────────────────────
  const [modalOpen,   setModalOpen  ] = useState(false)
  const [editItem,    setEditItem   ] = useState(null)
  const [deleteItem,  setDeleteItem ] = useState(null)
  const [pagarItem,   setPagarItem  ] = useState(null)
  const [generarOpen, setGenerarOpen] = useState(false)
  const [generarAnio, setGenerarAnio] = useState(String(anioActual))
  const [generarMes,  setGenerarMes ] = useState(String(new Date().getMonth() + 1))

  // ── Filter state ─────────────────────────────────────────
  const [filtroEstado,     setFiltroEstado    ] = useState('')
  const [filtroConcepto,   setFiltroConcepto  ] = useState('')
  const [filtroTipoPago,   setFiltroTipoPago  ] = useState('')
  const [filtroAnio,       setFiltroAnio      ] = useState('')
  const [filtroMes,        setFiltroMes       ] = useState('')

  // ── Queries ──────────────────────────────────────────────
  const { data: pagosData, isLoading } = useQuery({
    queryKey: ['pagos', filtroEstado, filtroConcepto, filtroTipoPago, filtroAnio, filtroMes],
    queryFn: () => pagosApi.listar({
      ...(filtroEstado    ? { estado:       filtroEstado    } : {}),
      ...(filtroConcepto  ? { concepto_id:  filtroConcepto  } : {}),
      ...(filtroTipoPago  ? { tipo_pago_id: filtroTipoPago  } : {}),
      ...(filtroAnio      ? { anio:         filtroAnio      } : {}),
      ...(filtroMes       ? { mes:          filtroMes       } : {}),
    }),
  })

  const { data: conceptosData } = useQuery({
    queryKey: ['conceptos-activos'],
    queryFn:  () => conceptosApi.listar({ activo: true }),
  })

  const { data: tiposPagoData } = useQuery({
    queryKey: ['tipos-pago-activos'],
    queryFn:  () => tiposPagoApi.listar({ activo: true }),
  })

  const pagos     = pagosData?.data?.data    ?? []
  const conceptos = conceptosData?.data?.data ?? []
  const tiposPago = tiposPagoData?.data?.data ?? []

  // ── Create/Edit form ─────────────────────────────────────
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: editItem
      ? {
          concepto_id:   editItem.concepto_id,
          tipo_pago_id:  editItem.tipo_pago_id ?? '',
          anio:          editItem.anio,
          mes:           editItem.mes,
          monto:         editItem.monto,
          es_pendiente:  editItem.estado === 'pendiente',
          fecha_pago:    editItem.fecha_pago?.slice(0, 10) ?? '',
          referencia:    editItem.referencia    ?? '',
          observaciones: editItem.observaciones ?? '',
        }
      : {
          concepto_id: '', tipo_pago_id: '', anio: anioActual, mes: new Date().getMonth() + 1,
          monto: '', es_pendiente: false, fecha_pago: hoy,
          referencia: '', observaciones: '',
        },
  })

  const esPendiente = useWatch({ control, name: 'es_pendiente' })

  // ── Pagar form ───────────────────────────────────────────
  const {
    register: rPagar, handleSubmit: hsPagar, reset: resetPagar,
    formState: { errors: errPagar },
  } = useForm({ resolver: zodResolver(schemaPagar) })

  // ── Handlers ─────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit   = (r) => { setEditItem(r);   setModalOpen(true) }
  const openPagar  = (r) => { resetPagar({ fecha_pago: hoy, referencia: '' }); setPagarItem(r) }
  const limpiar = () => { setFiltroEstado(''); setFiltroConcepto(''); setFiltroTipoPago(''); setFiltroAnio(''); setFiltroMes('') }

  // ── Mutations ────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        concepto_id:   values.concepto_id,
        tipo_pago_id:  values.tipo_pago_id || null,
        anio:          values.anio,
        mes:           values.mes,
        monto:         values.monto,
        observaciones: values.observaciones,
        estado:        values.es_pendiente ? 'pendiente' : 'pagado',
        ...(!values.es_pendiente
          ? { fecha_pago: values.fecha_pago, referencia: values.referencia }
          : { fecha_pago: null }),
      }
      return editItem ? pagosApi.actualizar(editItem.id, payload) : pagosApi.crear(payload)
    },
    onSuccess: () => {
      toast.success(editItem ? 'Pago actualizado' : 'Pago registrado')
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setModalOpen(false)
    },
  })

  const pagarMutation = useMutation({
    mutationFn: ({ fecha_pago, referencia }) =>
      pagosApi.actualizar(pagarItem.id, { estado: 'pagado', fecha_pago, referencia }),
    onSuccess: () => {
      toast.success('Pago confirmado')
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setPagarItem(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => pagosApi.eliminar(id),
    onSuccess: () => {
      toast.success('Pago eliminado')
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setDeleteItem(null)
    },
  })

  const generarMutation = useMutation({
    mutationFn: () => pagosApi.generar({ anio: Number(generarAnio), mes: Number(generarMes) }),
    onSuccess: (res) => {
      toast.success(res.data.mensaje)
      qc.invalidateQueries({ queryKey: ['pagos'] })
      setGenerarOpen(false)
    },
  })

  // ── Table columns ────────────────────────────────────────
  const columns = [
    { key: 'concepto',   header: 'Concepto',      render: (r) => r.concepto_nombre },
    { key: 'dato_pago',  header: 'Dato de pago',
      render: (r) => r.campo_referencia
        ? (
          <div className="text-sm">
            <span className="text-gray-400 text-xs block">{r.campo_referencia}</span>
            {r.referencia_valor_cuenta
              ? <span className="font-medium">{r.referencia_valor_cuenta}</span>
              : <span className="text-amber-500 text-xs">Sin dato</span>}
          </div>
        )
        : <span className="text-gray-400 text-xs">N/A</span>
    },
    { key: 'tipo_pago',  header: 'Tipo de pago',  render: (r) => r.tipo_pago_nombre ?? <span className="text-gray-400 text-xs">Sin tipo</span> },
    { key: 'periodo',    header: 'Período',       render: (r) => `${MESES[r.mes - 1]} ${r.anio}` },
    { key: 'monto',    header: 'Monto',      render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
    { key: 'estado',   header: 'Estado',     render: (r) => <Badge value={r.estado} /> },
    { key: 'fecha',    header: 'F. Pago',       render: (r) => r.fecha_pago?.slice(0, 10) ?? '—' },
    { key: 'ref',      header: 'Referencia',   render: (r) => r.referencia ?? '—' },
    { key: 'obs',      header: 'Observaciones', render: (r) => <span className="text-gray-500 max-w-xs truncate block">{r.observaciones ?? '—'}</span> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          {r.estado === 'pendiente' && (
            <button
              className="btn-success !py-1 !px-2"
              onClick={() => openPagar(r)}
              title="Confirmar pago"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button className="btn-secondary !py-1 !px-2" onClick={() => openEdit(r)} title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="btn-danger !py-1 !px-2" onClick={() => setDeleteItem(r)} title="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const pendientesCount = pagos.filter((p) => p.estado === 'pendiente').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-500 mt-1">
            Registro de pagos de servicios
            {pendientesCount > 0 && !filtroEstado && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={() => setGenerarOpen(true)}
            title="Generar pagos pendientes desde la plantilla mensual"
          >
            <Zap className="h-4 w-4" /> Generar del mes
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo pago
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-5 p-4 bg-white rounded-xl border border-gray-200 flex-wrap items-end">
        <Filter className="h-5 w-5 text-gray-400 self-center shrink-0" />
        <div className="flex flex-col">
          <label className="label">Estado</label>
          <select className="input !w-36" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="label">Tipo de pago</label>
          <select className="input !w-44" value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)}>
            <option value="">Todos</option>
            {tiposPago.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="label">Concepto</label>
          <select className="input !w-44" value={filtroConcepto} onChange={(e) => setFiltroConcepto(e.target.value)}>
            <option value="">Todos</option>
            {conceptos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="label">Año</label>
          <select className="input !w-28" value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
            <option value="">Todos</option>
            {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="label">Mes</label>
          <select className="input !w-36" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        {(filtroEstado || filtroConcepto || filtroTipoPago || filtroAnio || filtroMes) && (
          <button className="btn-secondary" onClick={limpiar}>Limpiar</button>
        )}
      </div>

      {isLoading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={pagos} emptyText="No hay pagos con los filtros seleccionados" />}

      {/* ── Modal crear / editar ──────────────────────────── */}
      <Modal
        key={editItem?.id ?? 'nuevo'} open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar pago' : 'Nuevo pago'}
      >
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          <FormField label="Concepto *" error={errors.concepto_id?.message}>
            <Select {...register('concepto_id')} error={errors.concepto_id}>
              <option value="">Selecciona un servicio</option>
              {conceptos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </Select>
          </FormField>

          <FormField label="Tipo de pago" error={errors.tipo_pago_id?.message}>
            <Select {...register('tipo_pago_id')} error={errors.tipo_pago_id}>
              <option value="">— Sin categoría —</option>
              {tiposPago.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Año *" error={errors.anio?.message}>
              <Select {...register('anio')} error={errors.anio}>
                {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </FormField>
            <FormField label="Mes *" error={errors.mes?.message}>
              <Select {...register('mes')} error={errors.mes}>
                {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Monto (S/) *" error={errors.monto?.message}>
            <Input {...register('monto')} type="number" step="0.01" min="0.01" placeholder="0.00" error={errors.monto} />
          </FormField>

          {/* Toggle pendiente */}
          <div className="flex items-center gap-2 my-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <input
              id="es_pendiente"
              type="checkbox"
              className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
              {...register('es_pendiente')}
            />
            <label htmlFor="es_pendiente" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
              Registrar como <span className="text-amber-700 font-semibold">pendiente</span> (confirmar pago después)
            </label>
          </div>

          {!esPendiente && (
            <>
              <FormField label="Fecha de pago *" error={errors.fecha_pago?.message}>
                <Input {...register('fecha_pago')} type="date" error={errors.fecha_pago} />
              </FormField>
              <FormField label="Referencia / N° comprobante" error={errors.referencia?.message}>
                <Input {...register('referencia')} placeholder="TXN-001" />
              </FormField>
            </>
          )}

          <FormField label="Observaciones" error={errors.observaciones?.message}>
            <Textarea {...register('observaciones')} placeholder="Notas opcionales" rows={2} />
          </FormField>

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal confirmar pago ──────────────────────────── */}
      <Modal open={!!pagarItem} onClose={() => setPagarItem(null)} title="Confirmar pago" size="sm">
        {pagarItem && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm space-y-0.5">
            <p className="font-semibold text-indigo-900">{pagarItem.concepto_nombre}</p>
            <p className="text-gray-600">{MESES[pagarItem.mes - 1]} {pagarItem.anio}</p>
            <p className="text-xl font-bold text-indigo-700 pt-1">S/ {Number(pagarItem.monto).toFixed(2)}</p>
          </div>
        )}
        <form onSubmit={hsPagar((v) => pagarMutation.mutate(v))}>
          <FormField label="Fecha de pago *" error={errPagar.fecha_pago?.message}>
            <Input {...rPagar('fecha_pago')} type="date" error={errPagar.fecha_pago} />
          </FormField>
          <FormField label="Referencia / N° comprobante" error={errPagar.referencia?.message}>
            <Input {...rPagar('referencia')} placeholder="TXN-001" />
          </FormField>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setPagarItem(null)}>Cancelar</button>
            <button type="submit" className="btn-success" disabled={pagarMutation.isPending}>
              {pagarMutation.isPending ? 'Confirmando…' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal generar pagos del mes ───────────────────── */}
      <Modal open={generarOpen} onClose={() => setGenerarOpen(false)} title="Generar pagos pendientes del mes" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Se crearán registros <span className="font-semibold text-amber-600">pendientes</span> para todos
          los servicios de tu plantilla mensual que aún no tengan pago en el período seleccionado.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex flex-col">
            <label className="label">Año</label>
            <select className="input" value={generarAnio} onChange={(e) => setGenerarAnio(e.target.value)}>
              {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="label">Mes</label>
            <select className="input" value={generarMes} onChange={(e) => setGenerarMes(e.target.value)}>
              {MESES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => setGenerarOpen(false)}>Cancelar</button>
          <button
            type="button" className="btn-primary"
            onClick={() => generarMutation.mutate()}
            disabled={generarMutation.isPending}
          >
            {generarMutation.isPending ? 'Generando…' : 'Generar pendientes'}
          </button>
        </div>
      </Modal>

      {/* ── Confirmar eliminar ────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Eliminar pago"
        message={`¿Eliminar el pago de "${deleteItem?.concepto_nombre}" (${deleteItem ? MESES[deleteItem.mes - 1] : ''} ${deleteItem?.anio})?`}
      />
    </div>
  )
}
