import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Providers } from './app/providers' // <-- Import Providers yang baru dibuat
import { router } from './app/router' // <-- Import router yang baru dibuat
import { RouterProvider } from '@tanstack/react-router'

// Render aplikasi dengan RouterProvider untuk mengaktifkan routing

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} /> {/* <-- Gunakan RouterProvider untuk routing */}
    </Providers>
  </StrictMode>,
)