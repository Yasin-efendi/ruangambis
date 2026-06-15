import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode } from 'react'

// Buat QueryClient dengan konfigurasi default
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data dianggap "stale" setelah 5 menit (default 0 = langsung stale)
      // Ini mengurangi request berulang ke Supabase
      staleTime: 5 * 60 * 1000,
      
      // Simpan cache di memory selama 10 menit setelah component unmount
      // Jika user kembali ke halaman dalam 10 menit, data langsung ada (no loading)
      gcTime: 10 * 60 * 1000,
      
      // Retry 1x jika request gagal (default 3x terlalu agresif untuk UX)
      retry: 1,
      
      // Jangan refetch saat window regain focus (menghemat bandwidth)
      refetchOnWindowFocus: false,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* DevTools hanya muncul di development mode */}
      {/* Ini membantu debug: lihat cache, query status, dll */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}