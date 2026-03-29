import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Layout from './components/layout/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Conceptos from './pages/Conceptos.jsx'
import Pagos from './pages/Pagos.jsx'
import Suscripciones from './pages/Suscripciones.jsx'
import Reporte from './pages/Reporte.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Spinner from './components/ui/Spinner.jsx'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="conceptos"  element={<Conceptos />} />
        <Route path="pagos"          element={<Pagos />} />
        <Route path="plantilla"      element={<Suscripciones />} />
        <Route path="reporte"        element={<Reporte />} />
        <Route path="usuarios"   element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
