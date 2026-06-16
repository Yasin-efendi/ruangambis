import { useAuthStore } from "@/stores/authStore"
import { signOut } from "@/services/authService"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * App.tsx — Halaman utama setelah login
 * 
 * Catatan: 
 * - Halaman ini sekarang berada di dalam authenticatedLayout
 * - Artinya, user HARUS login untuk mengaksesnya (Auth Guard aktif)
 * - initialize() TIDAK perlu dipanggil di sini karena sudah di-handle oleh beforeLoad di router.tsx
 * - Nantinya, halaman ini akan diganti dengan Dashboard yang sebenarnya
 */
export default function App() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-50 antialiased">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            🎉 Selamat Datang di RuangAmbis!
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Autentikasi berhasil. Fondasi aplikasi sudah siap.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 py-4">
          {/* Info User */}
          <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-2">
            <div className="text-sm text-zinc-400">Status:</div>
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <div className="h-3 w-3 rounded-full bg-green-400"></div>
              <span>✅ Logged In</span>
            </div>
            
            {user && (
              <div className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800 space-y-1">
                <div>Email: {user.email}</div>
                <div>User ID: {user.id.slice(0, 8)}...</div>
              </div>
            )}
          </div>

          {/* Info Auth Guard */}
          <div className="rounded-lg bg-violet-950/30 p-4 border border-violet-800/50 space-y-2">
            <div className="text-sm font-semibold text-violet-300">🔐 Auth Guard Aktif</div>
            <p className="text-xs text-violet-200/70">
              Halaman ini dilindungi oleh <code className="bg-violet-950 px-1 rounded">beforeLoad</code> di TanStack Router. 
              Jika kamu logout dan coba buka halaman ini, kamu akan otomatis dilempar ke <code className="bg-violet-950 px-1 rounded">/login</code>.
            </p>
          </div>

          {/* Checklist Progress */}
          <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-2">
            <div className="text-sm font-semibold text-zinc-300">📋 Progress Fase 1:</div>
            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
              <li className="text-green-400">✅ Supabase Client</li>
              <li className="text-green-400">✅ Auth Store (Zustand v5)</li>
              <li className="text-green-400">✅ Auth Service (login/register/logout)</li>
              <li className="text-green-400">✅ Halaman Login + Return URL</li>
              <li className="text-green-400">✅ Halaman Register + Token Invite</li>
              <li className="text-green-400">✅ Auth Guard (beforeLoad)</li>
              <li className="text-zinc-500">⏳ Halaman Profile (Fase 1B)</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}