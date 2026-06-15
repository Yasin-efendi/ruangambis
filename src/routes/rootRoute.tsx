import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'

// Root layout untuk seluruh aplikasi.
// Nantinya akan menjadi tempat Auth Guard,
// App Layout, dan provider global tingkat route.
function RootLayout() {
  return <Outlet />
}

// Menentukan route utama (root route) yang akan digunakan sebagai layout global untuk semua route lainnya
export const rootRoute = createRootRoute({
  component: RootLayout,
})