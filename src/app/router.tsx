import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'

// Wrapper global dari semua route di aplikasi
function RootLayout() {
  return <Outlet />
}

// Menentukan route utama (root route) yang akan digunakan sebagai layout global untuk semua route lainnya
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Menentukan route untuk halaman index (home page) yang akan ditampilkan saat pengguna mengakses path '/'
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>RuangAmbis</div>,
})

// Menentukan route untuk halaman login yang akan ditampilkan saat pengguna mengakses path '/login'
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Menentukan route untuk halaman dashboard yang akan ditampilkan saat pengguna mengakses path '/dashboard'
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

// Menyusun tree route dengan menambahkan indexRoute, loginRoute, dan dashboardRoute sebagai anak dari rootRoute
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
])

// Membuat dan mengekspor instance router utama yang akan digunakan di seluruh aplikasi dengan menggunakan routeTree yang telah dibuat
export const router = createRouter({
  routeTree,
})

// Memastikan bahwa TypeScript mengenal tipe router yang telah dibuat dengan menambahkan deklarasi module untuk '@tanstack/react-router' dan mengaitkannya dengan tipe router yang telah diekspor
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}