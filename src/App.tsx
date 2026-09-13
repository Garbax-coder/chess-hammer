import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import DashboardPage from '@/pages/DashboardPage'
import FaqPage from '@/pages/FaqPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NewSessionPage from '@/pages/NewSessionPage'
import SessionDetailPage from '@/pages/SessionDetailPage'
import SessionsHistoryPage from '@/pages/SessionsHistoryPage'
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
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <SessionsHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute>
            <SessionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <FaqPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
