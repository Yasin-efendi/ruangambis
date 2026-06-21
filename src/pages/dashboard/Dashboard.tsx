import { useAuthStore } from '@/stores/authStore'
import { signOut } from '@/services/authService'
import { useNavigate, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * DashboardPage — Halaman utama setelah login
 * 
 * Menampilkan:
 * - Greeting dinamis berdasarkan waktu
 * - Info profil user (dari authStore.profile)
 * - Quick links ke fitur utama
 * - Progress pembangunan aplikasi
 * 
 * Catatan: Statistik try-out akan ditambahkan di Fase 2A
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile, user } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/login' })
  }

  // Loading state saat profile masih di-fetch
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat dashboard...</span>
        </div>
      </div>
    )
  }

  // Greeting dinamis berdasarkan waktu
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 18) return 'Selamat Siang'
    return 'Selamat Malam'
  }

  const displayName = profile.full_name || profile.username

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header dengan greeting */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {getGreeting()}, {displayName}! 👋
            </h1>
            <p className="text-zinc-400 mt-1">
              Selamat datang di RuangAmbis. Siap belajar hari ini?
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 w-fit"
          >
            Logout
          </Button>
        </div>

        {/* Info Profile Card */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">Profil Kamu</CardTitle>
            <CardDescription className="text-zinc-400">
              Informasi akun RuangAmbis kamu
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Username</div>
              <div className="text-sm font-medium text-white">@{profile.username}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Email</div>
              <div className="text-sm font-medium text-white">{user?.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Sekolah</div>
              <div className="text-sm font-medium text-white">
                {profile.school_name || 'Belum diisi'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Role</div>
              <div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  profile.role === 'admin' 
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {profile.role === 'admin' ? '👑 Admin' : '🎓 Siswa'}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Status</div>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                  ● Aktif
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wide">Bergabung</div>
              <div className="text-sm font-medium text-white">
                {new Date(profile.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Mulai Aktivitas</h2>
          <div className="grid gap-4 md:grid-cols-4"> {/* <-- UBAH grid-cols-3 jadi grid-cols-4 */}
            <Link to="/profile"> {/* <-- WRAP dengan Link */}
                <Card className="border-zinc-800 bg-zinc-900 hover:bg-zinc-500 transition-colors cursor-pointer h-full">
                    <CardHeader>
                    <div className="text-3xl mb-2">👤</div>
                    <CardTitle className="text-white text-lg">Profil Saya</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Kelola informasi akun kamu
                    </CardDescription>
                    </CardHeader>
                </Card>
            </Link>
            <Link to="/tryout"> {/* <-- WRAP dengan Link */}
              <Card className="border-zinc-800 bg-zinc-900 hover:border-violet-500/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="text-3xl mb-2">📝</div>
                  <CardTitle className="text-white text-lg">Try Out</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Kerjakan paket soal dan lihat perkembanganmu
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Card className="border-zinc-800 bg-zinc-900 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="text-3xl mb-2">📊</div>
                <CardTitle className="text-white text-lg">Analitik</CardTitle>
                <CardDescription className="text-zinc-400">
                  Lihat grafik perkembangan nilaimu
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900 hover:border-teal-500/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="text-3xl mb-2">💬</div>
                <CardTitle className="text-white text-lg">Forum</CardTitle>
                <CardDescription className="text-zinc-400">
                  Diskusi soal dengan teman-teman
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Progress Checklist */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">🏗️ Progress Pembangunan</CardTitle>
            <CardDescription className="text-zinc-400">
              Fitur yang sudah selesai dibangun di RuangAmbis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 md:grid-cols-2 text-sm">
              <li className="flex items-center gap-2 text-green-400">
                <span>✅</span> Autentikasi (Login + Register + Token Invite)
              </li>
              <li className="flex items-center gap-2 text-green-400">
                <span>✅</span> Auth Guard (beforeLoad)
              </li>
              <li className="flex items-center gap-2 text-green-400">
                <span>✅</span> Dashboard dengan Profil User
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>⏳</span> Halaman Profile (Edit Data)
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>⏳</span> CBT / Try Out
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>⏳</span> Analytics
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>⏳</span> Forum Diskusi
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span>⏳</span> Admin Panel
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}