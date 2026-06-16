import { Outlet } from '@tanstack/react-router'

/**
 * AppLayout — Wrapper untuk semua halaman yang butuh autentikasi
 * 
 * Saat ini isinya sangat sederhana (hanya Outlet), tapi nanti kita bisa tambah:
 * - Sidebar navigasi
 * - Navbar dengan info user
 * - Footer
 * - Theme toggle
 * 
 * Semua child route (seperti /, /dashboard, /tryout) akan di-render
 * di dalam <Outlet /> ini.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Nanti di sini bisa ditambah Navbar/Sidebar */}
      
      <main>
        {/* Outlet adalah "wadah" untuk child routes */}
        <Outlet />
      </main>
    </div>
  )
}