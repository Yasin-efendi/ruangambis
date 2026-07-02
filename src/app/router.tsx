import { 
  createRouter, 
  createRootRoute, 
  createRoute, 
  Outlet,
  redirect 
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import App from '../App'
import LoginPage from '../pages/auth/Login'
import RegisterPage from '../pages/auth/Register'
import DashboardPage from '../pages/dashboard/Dashboard'
import ProfilePage from '../pages/profile/Profile' // <-- BARU: Import Profile
import AppLayout from '@/components/layout/AppLayout'
import { useAuthStore } from '@/stores/authStore'
import InstructionsPage from '../pages/tryout/Instructions' // <-- BARU
import PackagesPage from '../pages/tryout/Packages' // <-- BARU
import TakePage from '../pages/tryout/Take' // <-- BARU
import ResultPage from '../pages/tryout/Result' // <-- BARU
import ReviewPage from '../pages/tryout/Review' // <-- BARU
import AnalyticsPage from '../pages/analytics/Analytics' // <-- BARU

// ============================================================
// 1. ROOT ROUTE
// ============================================================
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})

// ============================================================
// 2. PUBLIC ROUTES
// ============================================================
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

// ============================================================
// 3. AUTHENTICATED LAYOUT
// ============================================================
const authenticatedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  component: AppLayout,
  
  beforeLoad: async ({ location }) => {
    const { initialize, isLoading } = useAuthStore.getState()
    await initialize()
    
    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const currentSession = useAuthStore.getState().session
    
    if (!currentSession) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

// ============================================================
// 4. INDEX ROUTE — Redirect ke /dashboard
// ============================================================
const indexRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
  component: App,
})

// ============================================================
// 5. DASHBOARD ROUTE
// ============================================================
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/dashboard',
  component: DashboardPage,
})

// ============================================================
// 6. PROFILE ROUTE — BARU!
// ============================================================
const profileRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/profile',
  component: ProfilePage,
})

// ============================================================
// 7. TRY-OUT ROUTES — CBT System
// ============================================================
const instructionsRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/tryout/$packageId/instructions',
  component: InstructionsPage,
})

// ============================================================
// 9. TAKE ROUTE — Pengerjaan Soal CBT
// ============================================================
const takeRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/tryout/$sessionId/take',
  component: TakePage,
})

// ============================================================
// 10. RESULT ROUTE — Halaman Hasil Try Out
// ============================================================
const resultRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/tryout/$sessionId/result',
  component: ResultPage,
})

// ============================================================
// 11. REVIEW ROUTE — Halaman Pembahasan Try Out
// ============================================================
const reviewRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/tryout/$sessionId/review',
  component: ReviewPage,
})

// ============================================================
// 12. ANALYTICS ROUTE — Halaman Analytics
// ============================================================
const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/analytics',
  component: AnalyticsPage,
})

// ============================================================
// 8. PACKAGES ROUTE — Daftar Paket Try Out
// ============================================================
const packagesRoute = createRoute({
  getParentRoute: () => authenticatedLayout,
  path: '/tryout',
  component: PackagesPage,
})

// ============================================================
// 7. ROUTE TREE
// ============================================================
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  
  authenticatedLayout.addChildren([
    indexRoute,
    dashboardRoute,
    profileRoute, // <-- BARU: Tambahkan profile route
    packagesRoute, // <-- BARU: Tambahkan packages route
    instructionsRoute, // <-- BARU: Tambahkan instructions route
    takeRoute, // <-- BARU
    resultRoute, // <-- BARU
    reviewRoute, // <-- BARU
    analyticsRoute, // <-- BARU
  ]),
])

// ============================================================
// 8. EXPORT & TYPE REGISTRATION
// ============================================================
export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}