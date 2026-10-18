import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import { isAdminUser } from '@/lib/admin'
import { useAuth } from '@/lib/auth-context'

// Pagine di amministrazione: chi non e' amministratore torna alla dashboard.
// E' solo cortesia: i dati arrivano da funzioni che il database nega a chi
// non e' amministratore.
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (!loading && user && !isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}
