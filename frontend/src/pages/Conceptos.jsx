import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { conceptosApi } from '../api/conceptos.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input, Textarea } from '../components/ui/Form.jsx'

const schema = z.object({
  nombre:           z.string().min(1, 'Requerido').max(100),
  descripcion:      z.string().max(500).optional(),
  campo_referencia: z.string().max(200).optional(),
})

export default function Conceptos() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editItem,  setEditItem]        = useState(null)
  const [deleteItem, setDeleteItem]     = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['conceptos'],
    queryFn: () => conceptosApi.listar(),
  })
  const conceptos = data?.data?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: editItem
      ? { nombre: editItem.nombre, descripcion: editItem.descripcion ?? '', campo_referencia: editItem.campo_referencia ?? '' }
      : { nombre: '', descripcion: '', campo_referencia: '' },
  })

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (values) => editItem
      ? conceptosApi.actualizar(editItem.id, values)
      : conceptosApi.crear(values),
    onSuccess: () => {
      toast.success(editItem ? 'Concepto actualizado' : 'Concepto creado')
      qc.invalidateQueries({ queryKey: ['conceptos'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => conceptosApi.eliminar(id),
    onSuccess: () => {
      toast.success('Concepto desactivado')
      qc.invalidateQueries({ queryKey: ['conceptos'] })
      setDeleteItem(null)
    },
  })

  const columns = [
    { key: 'nombre',           header: 'Nombre' },
    { key: 'descripcion',      header: 'Descripción',        render: (r) => r.descripcion      ?? '—' },
    { key: 'campo_referencia', header: 'Dato para pagar',    render: (r) => r.campo_referencia ?? <span className="text-gray-400 text-xs">No requerido</span> },
    { key: 'activo',           header: 'Estado',             render: (r) => <Badge value={r.activo} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <button className="btn-secondary !py-1 !px-2" onClick={() => openEdit(r)} title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="btn-danger !py-1 !px-2" onClick={() => setDeleteItem(r)} title="Desactivar" disabled={!r.activo}>
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
          <h1 className="text-2xl font-bold text-gray-900">Conceptos</h1>
          <p className="text-gray-500 mt-1">Tipos de servicios disponibles</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo concepto
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <Table columns={columns} data={conceptos} emptyText="No hay conceptos registrados" />
      )}

      {/* Modal crear / editar */}
      <Modal key={editItem?.id ?? 'crear'} open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar concepto' : 'Nuevo concepto'}>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          <FormField label="Nombre *" error={errors.nombre?.message}>
            <Input {...register('nombre')} placeholder="Ej: Agua potable" error={errors.nombre} />
          </FormField>
          <FormField label="Descripción" error={errors.descripcion?.message}>
            <Textarea {...register('descripcion')} placeholder="Descripción opcional" />
          </FormField>
          <FormField
            label="Dato requerido para pagar"
            error={errors.campo_referencia?.message}
            hint="Etiqueta del dato que necesitas para realizar el pago (ej: Código de usuario, Número de cuenta, Número de celular)"
          >
            <Input {...register('campo_referencia')} placeholder="Ej: Código de usuario" error={errors.campo_referencia} />
          </FormField>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmación eliminar */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem.id)}
        loading={deleteMutation.isPending}
        title="Desactivar concepto"
        message={`¿Desactivar el concepto "${deleteItem?.nombre}"?`}
      />
    </div>
  )
}
