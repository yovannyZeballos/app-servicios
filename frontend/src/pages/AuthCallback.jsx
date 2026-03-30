import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function AuthCallback() {
  const [params]      = useSearchParams()
  const navigate      = useNavigate()
  const { saveSession } = useAuth()

  useEffect(() => {
    const accessToken  = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const error        = params.get('error')

    if (error || !accessToken || !refreshToken) {
      navigate('/login?error=oauth', { replace: true })
      return
    }

    const usuario = {
      id:           Number(params.get('id')),
      nombre:       params.get('nombre'),
      email:        params.get('email'),
      rol:          params.get('rol'),
      principal_id: params.get('principal_id') ? Number(params.get('principal_id')) : null,
    }

    saveSession(accessToken, refreshToken, usuario)
    navigate('/dashboard', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center">
      <div className="text-center text-white space-y-4">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="text-indigo-200 text-sm">Iniciando sesión con Google…</p>
      </div>
    </div>
  )
}
