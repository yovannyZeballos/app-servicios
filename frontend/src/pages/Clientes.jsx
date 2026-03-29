import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { clientesApi } from '../api/clientes.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input } from '../components/ui/Form.jsx'

const schema = z.object({
  nombre:    z.string().min(1, 'Requerido').max(100),
  apellido:  z.string().min(1, 'Requerido').max(100),
  email:     z.string().min(1, 'Requerido').email('Email inválido'),
  telefono:  z.string().max(20).optional(),
  direccion: z.string().max(500).optional(),
})

export default function Clientes() {
  const qc = useQueryClient()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.listar(),
  })
  const clientes = data?.data?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const openCreate = () => { setEditItem(null); reset({}); setModalOpen(true) }
  const openEdit   = (r)  => { setEditItem(r); reset({ nombre: r.nombre, apellido: r.apellido, email: r.email, telefono: r.telefono ?? '', direccion: r.direccion ?? '' }); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (values) => editItem ? clientesApi.actualizar(editItem.id, values) : clientesApi.crear(values),
    onSuccess: () => {
      toast.success(editItem ? 'Cliente actualizado' : 'Cliente creado')
      qc.invalidateQueries({ queryKey: ['clientes'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => clientesApi.eliminar(id),
    onSuccess: () => {
      toast.success('Cliente desactivado')
      qc.invalidateQueries({ queryKey: ['clientes'] })
      setDeleteItem(null)
    },
  })

  const columns = [
    { key: 'nombre',   header: 'Nombre',   render: (r) => `${r.nombre} ${r.apellido}` },
    { key: 'email',    header: 'Email' },
    { key: 'telefono', header: 'Teléfono', render: (r) => r.telefono ?? '—' },
    { key: 'direccion',header: 'Dirección',render: (r) => <span className="max-w-xs truncate block">{r.direccion ?? '—'}</span> },
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestión de clientes</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> Nuevo cliente</button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={clientes} emptyText="No hay clientes registrados" />}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar cliente' : 'Nuevo cliente'}>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          <div className="grid grid-cols-2 gap-x-4">
            <FormField label="Nombre *" error={errors.nombre?.message}>
              <Input {...register('nombre')} placeholder="Juan" error={errors.nombre} />
            </FormField>
            <FormField label="Apellido *" error={errors.apellido?.message}>
              <Input {...register('apellido')} placeholder="Pérez" error={errors.apellido} />
            </FormField>
          </div>
          <FormField label="Email *" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="juan@email.com" error={errors.email} />
          </FormField>
          <div className="grid grid-cols-2 gap-x-4">
            <FormField label="Teléfono" error={errors.telefono?.message}>
              <Input {...register('telefono')} placeholder="555-1234" />
            </FormField>
            <FormField label="Dirección" error={errors.direccion?.message}>
              <Input {...register('direccion')} placeholder="Av. Principal 123" />
            </FormField>
          </div>
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
        title="Desactivar cliente"
        message={`¿Desactivar a "${deleteItem?.nombre} ${deleteItem?.apellido}"?`}
      />
    </div>
  )
}
