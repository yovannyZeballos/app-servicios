import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
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

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
            <span className="bg-white px-2">o continuá con</span>
          </div>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL ?? '/api'}/auth/google`}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </a>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
