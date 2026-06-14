import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { router } from './app/router'
import { useAuthStore } from './stores/authStore'

export default function App() {
  // mengambil fungsi initialize dari Zustand store untuk memeriksa status autentikasi user
  const initialize = useAuthStore(
    (state) => state.initialize,
  )

  // inisialisasi sesion saat aplikasi pertama kali dimuat agar status login user langsung sinkron
  useEffect(() => {
    void initialize()
  }, [initialize])

  return <RouterProvider router={router} />
}