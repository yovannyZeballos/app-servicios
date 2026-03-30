import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { tiposPagoApi } from '../api/tipos_pago.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input, Textarea } from '../components/ui/Form.jsx'

const schema = z.object({
  nombre:      z.string().min(1, 'Requerido').max(100),
  descripcion: z.string().max(500).optional(),
})

export default function TiposPago() {
  const qc = useQueryClient()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['tipos-pago'],
    queryFn: () => tiposPagoApi.listar(),
  })
  const tipos = data?.data?.data ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: editItem
      ? { nombre: editItem.nombre, descripcion: editItem.descripcion ?? '' }
      : { nombre: '', descripcion: '' },
  })

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (values) => editItem
      ? tiposPagoApi.actualizar(editItem.id, values)
      : tiposPagoApi.crear(values),
    onSuccess: () => {
      toast.success(editItem ? 'Tipo de pago actualizado' : 'Tipo de pago creado')
      qc.invalidateQueries({ queryKey: ['tipos-pago'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => tiposPagoApi.eliminar(id),
    onSuccess: () => {
      toast.success('Tipo de pago desactivado')
      qc.invalidateQueries({ queryKey: ['tipos-pago'] })
      setDeleteItem(null)
    },
  })

  const columns = [
    { key: 'nombre',      header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción', render: (r) => r.descripcion ?? '—' },
    { key: 'activo',      header: 'Estado',       render: (r) => <Badge value={r.activo} /> },
    {
      key: 'acciones', header: 'Acciones',
      render: (r) => (
        <div className="flex gap-2">
          <button className="btn-secondary !py-1 !px-2" onClick={() => openEdit(r)} title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="btn-danger !py-1 !px-2"
            onClick={() => setDeleteItem(r)}
            title="Desactivar"
            disabled={!r.activo}
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Pago</h1>
          <p className="text-gray-500 mt-1">Categorías para agrupar tus pagos</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo tipo
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <Table columns={columns} data={tipos} emptyText="No hay tipos de pago registrados" />
      )}

      <Modal
        key={editItem?.id ?? 'nuevo'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Editar tipo de pago' : 'Nuevo tipo de pago'}
      >
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          <FormField label="Nombre *" error={errors.nombre?.message}>
            <Input {...register('nombre')} placeholder="Ej: Servicios del hogar" error={errors.nombre} />
          </FormField>
          <FormField label="Descripción" error={errors.descripcion?.message}>
            <Textarea {...register('descripcion')} placeholder="Descripción opcional" rows={3} />
          </FormField>
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
        title="Desactivar tipo de pago"
        message={`¿Desactivar el tipo de pago "${deleteItem?.nombre}"?`}
      />
    </div>
  )
}
