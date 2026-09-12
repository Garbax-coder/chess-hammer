import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import DashboardPage from '@/pages/DashboardPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NewSessionPage from '@/pages/NewSessionPage'
import SignupPage from '@/pages/SignupPage'
import TrainPage from '@/pages/TrainPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/new"
        element={
          <ProtectedRoute>
            <NewSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/train"
        element={
          <ProtectedRoute>
            <TrainPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
