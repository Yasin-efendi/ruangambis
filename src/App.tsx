import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'

import { router } from './app/router'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading)
  // mengambil fungsi initialize dari Zustand store untuk memeriksa status autentikasi user
  const initialize = useAuthStore(
    (state) => state.initialize,
  )

  const subscribeToAuthChanges =
    useAuthStore(
      (state) => state.subscribeToAuthChanges,
    )

  // inisialisasi sesion saat aplikasi pertama kali dimuat agar status login user langsung sinkron
  useEffect(() => {
    void initialize()

    const unsubscribe =
      subscribeToAuthChanges()

    return unsubscribe
  }, [initialize, subscribeToAuthChanges])

  // Menampilkan UI loading, mencegah flickering
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }  

  return <RouterProvider router={router} />
}