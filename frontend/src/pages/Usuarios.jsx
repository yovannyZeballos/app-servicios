import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { usuariosApi } from '../api/usuarios.js'
import Table from '../components/ui/Table.jsx'
import Modal from '../components/ui/Modal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { FormField, Input, Select } from '../components/ui/Form.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const schemaCrear = z.object({
  nombre:   z.string().min(1, 'Requerido').max(100),
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol:      z.enum(['admin', 'user']),
})
const schemaEditar = z.object({
  nombre:   z.string().min(1, 'Requerido').max(100),
  email:    z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  rol:      z.enum(['admin', 'user']),
  activo:   z.boolean().optional(),
})

export default function Usuarios() {
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.listar(),
  })
  const usuarios = data?.data?.data ?? []

  const schema = editItem ? schemaEditar : schemaCrear
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    values: editItem
      ? { nombre: editItem.nombre, email: editItem.email, password: '', rol: editItem.rol, activo: editItem.activo }
      : { nombre: '', email: '', password: '', rol: 'user' },
  })

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit   = (item) => { setEditItem(item); setModalOpen(true) }

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = { ...values }
      // If password is empty string during edit, remove from payload
      if (editItem && !payload.password) delete payload.password
      return editItem
        ? usuariosApi.actualizar(editItem.id, payload)
        : usuariosApi.crear(payload)
    },
    onSuccess: () => {
      toast.success(editItem ? 'Usuario actualizado' : 'Usuario creado')
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => usuariosApi.eliminar(id),
    onSuccess: () => {
      toast.success('Usuario desactivado')
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      setDeleteItem(null)
    },
  })

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email',  header: 'Email' },
    { key: 'rol',    header: 'Rol',    render: (r) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
        {r.rol}
      </span>
    )},
    { key: 'activo', header: 'Estado', render: (r) => <Badge value={r.activo} /> },
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
            disabled={!r.activo || r.id === me?.id}
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
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">Gestión de cuentas de usuario</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      {isLoading
        ? <div className="flex justify-center py-16"><Spinner /></div>
        : <Table columns={columns} data={usuarios} emptyText="No hay usuarios registrados" />}

      <Modal key={editItem?.id ?? 'nuevo'} open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar usuario' : 'Nuevo usuario'}>
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))}>
          <FormField label="Nombre *" error={errors.nombre?.message}>
            <Input {...register('nombre')} placeholder="Juan Pérez" error={errors.nombre} />
          </FormField>
          <FormField label="Email *" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="juan@ejemplo.com" error={errors.email} />
          </FormField>
          <FormField label={editItem ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'} error={errors.password?.message}>
            <Input {...register('password')} type="password" placeholder="••••••••" error={errors.password} />
          </FormField>
          <FormField label="Rol *" error={errors.rol?.message}>
            <Select {...register('rol')} error={errors.rol}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </Select>
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
        title="Desactivar usuario"
        message={`¿Desactivar al usuario "${deleteItem?.nombre}"?`}
      />
    </div>
  )
}
