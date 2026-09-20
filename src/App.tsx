import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import DashboardPage from '@/pages/DashboardPage'
import FaqPage from '@/pages/FaqPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import NewSessionPage from '@/pages/NewSessionPage'
import PrivacyPage from '@/pages/PrivacyPage'
import ProfilePage from '@/pages/ProfilePage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import SessionDetailPage from '@/pages/SessionDetailPage'
import SessionsHistoryPage from '@/pages/SessionsHistoryPage'
import SignupPage from '@/pages/SignupPage'
import TermsPage from '@/pages/TermsPage'
import TrainPage from '@/pages/TrainPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  )
}

export default App
