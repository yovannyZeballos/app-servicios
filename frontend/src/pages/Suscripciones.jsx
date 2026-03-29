import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Zap } from 'lucide-react'
import { suscripcionesApi } from '../api/suscripciones.js'
import { conceptosApi }     from '../api/conceptos.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input, Select } from '../components/ui/Form.jsx'

const schemaCrear = z.object({
  concepto_id:      z.coerce.number({ invalid_type_error: 'Selecciona un servicio' }).int().min(1, 'Requerido'),
  monto_referencia: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).positive('Debe ser > 0'),
})

const schemaEditar = z.object({
  monto_referencia: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).positive('Debe ser > 0'),
  activo:           z.boolean().optional(),
})

export default function Suscripciones() {
  const qc = useQueryClient()
  const [modalOpen,  setModalOpen ] = useState(false)
  const [editItem,   setEditItem  ] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['suscripciones'],
    queryFn:  () => suscripcionesApi.listar(),
  })
  const { data: conceptosData } = useQuery({
    queryKey: ['conceptos-activos'],
    queryFn:  () => conceptosApi.listar({ activo: true }),
  })

  const suscripciones = data?.data?.data         ?? []
  const conceptos     = conceptosData?.data?.data ?? []

  const schema = editItem ? schemaEditar : schemaCrear

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: editItem
      ? { monto_referencia: editItem.monto_referencia, activo: editItem.activo }
      : { concepto_id: '', monto_referencia: '' },
  })

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (values) => editItem
      ? suscripcionesApi.actualizar(editItem.id, values)
      : suscripcionesApi.crear(values),
    onSuccess: () => {
      toast.success(editItem ? 'Servicio actualizado' : 'Servicio agregado a la plantilla')
      qc.invalidateQueries({ queryKey: ['suscripciones'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => suscripcionesApi.eliminar(id),
    onSuccess: () => {
      toast.success('Servicio eliminado de la plantilla')
      qc.invalidateQueries({ queryKey: ['suscripciones'] })
      setDeleteItem(null)
    },
  })

  const columns = [
    { key: 'concepto', header: 'Servicio',           render: (r) => r.concepto_nombre },
    { key: 'monto',    header: 'Monto referencia',   render: (r) => `S/ ${Number(r.monto_referencia).toFixed(2)}` },
    { key: 'activo',   header: 'Estado',             render: (r) => <Badge value={r.activo} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-500" />
            Plantilla mensual
          </h1>
          <p className="text-gray-500 mt-1">
            Servicios que pagas todos los meses. Desde <strong>Mis Pagos</strong> puedes generar los pendientes de un período con un clic.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Agregar servicio
        </button>
      </div>

      {/* Info card */}
      {!isLoading && suscripciones.length > 0 && (
        <div className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800">
          <span className="font-semibold">{suscripciones.filter(s => s.activo).length} servicio(s) activo(s)</span>
          {' '}— total referencial mensual:{' '}
          <span className="font-bold">
            S/ {suscripciones.filter(s => s.activo).reduce((acc, s) => acc + Number(s.monto_referencia), 0).toFixed(2)}
          </span>
        </div>
      )}

      {isLoading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={suscripciones} emptyText="No tienes servicios en tu plantilla mensual. Agrega los servicios que pagas todos los meses." />}

      {/* Modal crear / editar */}
      <Modal
        key={editItem?.id ?? 'nuevo'} open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar servicio' : 'Agregar servicio a la plantilla'}
      >
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          {!editItem && (
            <FormField label="Servicio *" error={errors.concepto_id?.message}>
              <Select {...register('concepto_id')} error={errors.concepto_id}>
                <option value="">Selecciona un servicio</option>
                {conceptos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </Select>
            </FormField>
          )}
          {editItem && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{editItem.concepto_nombre}</p>
              <p className="text-xs text-gray-500 mt-0.5">Servicio mensual</p>
            </div>
          )}
          <FormField label="Monto de referencia (S/) *" error={errors.monto_referencia?.message}>
            <Input
              {...register('monto_referencia')}
              type="number" step="0.01" min="0.01"
              placeholder="0.00"
              error={errors.monto_referencia}
            />
          </FormField>
          {editItem && (
            <FormField label="Estado" error={errors.activo?.message}>
              <Select {...register('activo', { setValueAs: (v) => v === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </FormField>
          )}
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Eliminar de la plantilla"
        message={`¿Eliminar "${deleteItem?.concepto_nombre}" de tu plantilla mensual?`}
      />
    </div>
  )
}
