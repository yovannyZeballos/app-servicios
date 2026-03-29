import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { serviciosApi } from '../api/servicios.js'
import { clientesApi }  from '../api/clientes.js'
import { conceptosApi } from '../api/conceptos.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input, Select } from '../components/ui/Form.jsx'

const schemaCrear = z.object({
  cliente_id:  z.coerce.number().min(1, 'Seleccione un cliente'),
  concepto_id: z.coerce.number().min(1, 'Seleccione un concepto'),
  monto:       z.coerce.number({ invalid_type_error: 'Número requerido' }).gt(0, 'Debe ser > 0').optional(),
  fecha_inicio: z.string().min(1, 'Requerido'),
})

const schemaEditar = z.object({
  monto:    z.coerce.number().gt(0).optional(),
  fecha_fin: z.string().optional(),
})

export default function Servicios() {
  const qc = useQueryClient()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data,           isLoading }  = useQuery({ queryKey: ['servicios'],        queryFn: () => serviciosApi.listar() })
  const { data: clData }               = useQuery({ queryKey: ['clientes-activos'], queryFn: () => clientesApi.listar({ activo: true }) })
  const { data: coData }               = useQuery({ queryKey: ['conceptos-activos'],queryFn: () => conceptosApi.listar({ activo: true }) })

  const servicios = data?.data?.data ?? []
  const clientes  = clData?.data?.data ?? []
  const conceptos = coData?.data?.data ?? []

  const schema = editItem ? schemaEditar : schemaCrear
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const openCreate = () => { setEditItem(null); reset({ fecha_inicio: new Date().toISOString().slice(0,10) }); setModalOpen(true) }
  const openEdit   = (r)  => { setEditItem(r); reset({ monto: r.monto, fecha_fin: r.fecha_fin ?? '' }); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (v) => editItem ? serviciosApi.actualizar(editItem.id, v) : serviciosApi.crear(v),
    onSuccess: () => {
      toast.success(editItem ? 'Servicio actualizado' : 'Servicio creado')
      qc.invalidateQueries({ queryKey: ['servicios'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => serviciosApi.eliminar(id),
    onSuccess: () => { toast.success('Servicio desactivado'); qc.invalidateQueries({ queryKey: ['servicios'] }); setDeleteItem(null) },
  })

  const columns = [
    { key: 'cliente',  header: 'Cliente',  render: (r) => `${r.cliente_nombre} ${r.cliente_apellido}` },
    { key: 'concepto', header: 'Concepto', render: (r) => r.concepto_nombre },
    { key: 'monto',    header: 'Monto',    render: (r) => `S/ ${Number(r.monto).toFixed(2)}` },
    { key: 'fecha_inicio', header: 'Inicio', render: (r) => r.fecha_inicio?.slice(0,10) },
    { key: 'fecha_fin',    header: 'Fin',    render: (r) => r.fecha_fin?.slice(0,10) ?? '—' },
    { key: 'activo',   header: 'Estado',   render: (r) => <Badge value={r.activo} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <button className="btn-secondary !py-1 !px-2" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></button>
          <button className="btn-danger !py-1 !px-2"    onClick={() => setDeleteItem(r)} disabled={!r.activo}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-gray-500 mt-1">Servicios contratados por cliente</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo servicio</button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={servicios} emptyText="No hay servicios registrados" />}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar servicio' : 'Nuevo servicio'}>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          {!editItem && (
            <>
              <FormField label="Cliente *" error={errors.cliente_id?.message}>
                <Select {...register('cliente_id')} error={errors.cliente_id} defaultValue="">
                  <option value="" disabled>Seleccionar cliente</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                </Select>
              </FormField>
              <FormField label="Concepto *" error={errors.concepto_id?.message}>
                <Select {...register('concepto_id')} error={errors.concepto_id} defaultValue="">
                  <option value="" disabled>Seleccionar concepto</option>
                  {conceptos.map((c) => <option key={c.id} value={c.id}>{c.nombre} — S/ {Number(c.monto_base).toFixed(2)}</option>)}
                </Select>
              </FormField>
              <FormField label="Fecha inicio *" error={errors.fecha_inicio?.message}>
                <Input {...register('fecha_inicio')} type="date" error={errors.fecha_inicio} />
              </FormField>
            </>
          )}
          <FormField label="Monto (S/) — deja vacío para usar el del concepto" error={errors.monto?.message}>
            <Input {...register('monto')} type="number" step="0.01" min="0.01" placeholder="0.00" error={errors.monto} />
          </FormField>
          {editItem && (
            <FormField label="Fecha fin" error={errors.fecha_fin?.message}>
              <Input {...register('fecha_fin')} type="date" />
            </FormField>
          )}
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Desactivar servicio"
        message={`¿Desactivar el servicio de "${deleteItem?.cliente_nombre} ${deleteItem?.cliente_apellido}"?`}
      />
    </div>
  )
}
