import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import { useApplyAppStyle } from '@/hooks/use-app-style'
import { MARKETING_PAGES } from '@/lib/marketing'
import GuidePage from '@/pages/GuidePage'
import LandingPage from '@/pages/LandingPage'

// Le pagine pubbliche (home e guida) stanno nel pacchetto iniziale e vengono
// pre-generate in HTML; il resto dell'app si scarica solo quando serve, cosi'
// chi arriva da un motore di ricerca non scarica dashboard, allenamento e
// analisi solo per leggere la home.
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const NewSessionPage = lazy(() => import('@/pages/NewSessionPage'))
const TrainPage = lazy(() => import('@/pages/TrainPage'))
const SessionsHistoryPage = lazy(() => import('@/pages/SessionsHistoryPage'))
const SessionDetailPage = lazy(() => import('@/pages/SessionDetailPage'))
const DailySessionSummaryPage = lazy(() => import('@/pages/DailySessionSummaryPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const CreditsPage = lazy(() => import('@/pages/CreditsPage'))

function Protected({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

function App() {
  useApplyAppStyle()

  return (
    <Suspense fallback={null}>
      <Routes>
        {MARKETING_PAGES.map(({ id, lang, path }) => (
          <Route
            key={path}
            path={path}
            element={
              id === 'home' ? <LandingPage lang={lang} /> : <GuidePage lang={lang} />
            }
          />
        ))}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/sessions/new"
          element={
            <Protected>
              <NewSessionPage />
            </Protected>
          }
        />
        <Route
          path="/train"
          element={
            <Protected>
              <TrainPage />
            </Protected>
          }
        />
        <Route
          path="/sessions"
          element={
            <Protected>
              <SessionsHistoryPage />
            </Protected>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <Protected>
              <SessionDetailPage />
            </Protected>
          }
        />
        <Route
          path="/sessions/:id/day/:date"
          element={
            <Protected>
              <DailySessionSummaryPage />
            </Protected>
          }
        />
        <Route
          path="/faq"
          element={
            <Protected>
              <FaqPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/credits" element={<CreditsPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
