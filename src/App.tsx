import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from '@/components/admin/admin-route'
import { ProtectedRoute } from '@/components/protected-route'
import { ScrollToTopOnNavigate } from '@/components/scroll-to-top'
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
const SessionDetailPage = lazy(() => import('@/pages/SessionDetailPage'))
const SessionSummaryPage = lazy(() => import('@/pages/SessionSummaryPage'))
const RoundSummaryPage = lazy(() => import('@/pages/RoundSummaryPage'))
const DailySessionSummaryPage = lazy(() => import('@/pages/DailySessionSummaryPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const StatsPage = lazy(() => import('@/pages/StatsPage'))
const ThemePracticePage = lazy(() => import('@/pages/ThemePracticePage'))
const OpeningsPage = lazy(() => import('@/pages/OpeningsPage'))
const OpeningDrillPage = lazy(() => import('@/pages/OpeningDrillPage'))
const OpeningLinesPage = lazy(() => import('@/pages/OpeningLinesPage'))
const OpeningLearnPage = lazy(() => import('@/pages/OpeningLearnPage'))
const OpeningCyclesPage = lazy(() => import('@/pages/OpeningCyclesPage'))
const OpeningImportPage = lazy(() => import('@/pages/OpeningImportPage'))
const OpeningEcoPage = lazy(() => import('@/pages/OpeningEcoPage'))
const OpeningNewPage = lazy(() => import('@/pages/OpeningNewPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const CreditsPage = lazy(() => import('@/pages/CreditsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const AdminUserPage = lazy(() => import('@/pages/AdminUserPage'))

function Protected({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

function App() {
  useApplyAppStyle()

  return (
    <Suspense fallback={null}>
      <ScrollToTopOnNavigate />
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
        {/* Lo storico delle sessioni e' nella dashboard: i vecchi link ci portano. */}
        <Route path="/sessions" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/sessions/:id"
          element={
            <Protected>
              <SessionDetailPage />
            </Protected>
          }
        />
        <Route
          path="/sessions/:id/summary"
          element={
            <Protected>
              <SessionSummaryPage />
            </Protected>
          }
        />
        <Route
          path="/sessions/:id/rounds/:round"
          element={
            <Protected>
              <RoundSummaryPage />
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
          path="/stats"
          element={
            <Protected>
              <StatsPage />
            </Protected>
          }
        />
        <Route
          path="/stats/themes/:theme"
          element={
            <Protected>
              <ThemePracticePage />
            </Protected>
          }
        />
        <Route
          path="/openings"
          element={
            <Protected>
              <OpeningsPage />
            </Protected>
          }
        />
        <Route
          path="/openings/import"
          element={
            <Protected>
              <OpeningImportPage />
            </Protected>
          }
        />
        <Route
          path="/openings/eco"
          element={
            <Protected>
              <OpeningEcoPage />
            </Protected>
          }
        />
        <Route
          path="/openings/new"
          element={
            <Protected>
              <OpeningNewPage />
            </Protected>
          }
        />
        <Route
          path="/openings/:slug"
          element={
            <Protected>
              <OpeningDrillPage />
            </Protected>
          }
        />
        <Route
          path="/openings/:slug/lines"
          element={
            <Protected>
              <OpeningLinesPage />
            </Protected>
          }
        />
        <Route
          path="/openings/:slug/learn"
          element={
            <Protected>
              <OpeningLearnPage />
            </Protected>
          }
        />
        <Route
          path="/openings/:slug/cycles"
          element={
            <Protected>
              <OpeningCyclesPage />
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
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <AdminUserPage />
            </AdminRoute>
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
