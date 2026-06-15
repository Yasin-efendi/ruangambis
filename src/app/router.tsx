import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import App from '../App'

// 1. Root Route: Membungkus seluruh aplikasi
const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* Outlet adalah tempat child routes (seperti indexRoute) akan di-render */}
      <Outlet />
      
      {/* DevTools untuk debugging routing (hanya di development) */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})

// 2. Index Route: Halaman utama (saat ini masih menggunakan komponen App.tsx)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

// 3. Buat Route Tree (Gabungkan root dengan child routes)
const routeTree = rootRoute.addChildren([indexRoute])

// 4. Export instance router
export const router = createRouter({ routeTree })

// 5. Register types (WAJIB untuk type-safety di TanStack Router v1)
// Ini memberitahu TypeScript tentang struktur router kita
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}