import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext.jsx'
import { FormField, Input } from '../components/ui/Form.jsx'
import Spinner from '../components/ui/Spinner.jsx'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Requerido'),
})

export default function Login() {
  const { login } = useAuth()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      await login(values)
    } catch (err) {
      const msg = err.response?.data?.mensaje ?? 'Error al iniciar sesión'
      setError('password', { message: msg })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">App Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de pagos mensuales</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Correo electrónico" error={errors.email?.message}>
            <Input
              {...register('email')}
              type="email"
              placeholder="admin@app.com"
              autoComplete="email"
              error={errors.email}
            />
          </FormField>

          <FormField label="Contraseña" error={errors.password?.message}>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password}
            />
          </FormField>

          <button
            type="submit"
            className="btn-primary w-full justify-center mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? <><Spinner className="h-4 w-4" /> Ingresando…</> : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
