import { useState, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { registerSchema } from '@/lib/validations/register'
import { registerWithInvite } from '@/services/registerService'
import { supabase } from '@/services/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const navigate = useNavigate()
  
  // 1. Baca token dari URL query parameter
  const { token } = useSearch({ strict: false }) as { token?: string }
  
  // 2. State untuk form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  
  // 3. State untuk UI & Error
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  // 4. Validasi token saat halaman dibuka
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token invite tidak ditemukan di URL.')
        setIsValidatingToken(false)
        return
      }

      try {
        const { data: invite, error: inviteError } = await supabase
          .from('invitations')
          .select('email, expires_at, used_at')
          .eq('token', token)
          .single()

        if (inviteError || !invite) {
          setError('Token invite tidak valid atau tidak ditemukan.')
          setIsValidatingToken(false)
          return
        }

        if (invite.used_at) {
          setError('Token invite ini sudah digunakan.')
          setIsValidatingToken(false)
          return
        }

        if (new Date(invite.expires_at) < new Date()) {
          setError('Token invite sudah kedaluwarsa.')
          setIsValidatingToken(false)
          return
        }

        // Token valid, pre-fill email
        setEmail(invite.email)
        setIsTokenValid(true)
        setIsValidatingToken(false)
      } catch (err) {
        console.error('Token validation error:', err)
        setError('Gagal memvalidasi token. Silakan coba lagi.')
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [token])

  // 5. Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!token) {
      setError('Token invite tidak ditemukan.')
      setIsLoading(false)
      return
    }

    // 6. Validasi menggunakan Zod
    const result = registerSchema.safeParse({
      token,
      email,
      password,
      confirmPassword,
      username,
      fullName,
      schoolName: schoolName || undefined,
    })

    if (!result.success) {
      setError(result.error.errors[0].message)
      setIsLoading(false)
      return
    }

    // 7. Panggil registerService
    const response = await registerWithInvite(result.data)

    if (!response.success) {
      setError(response.message)
      setIsLoading(false)
      return
    }

    // 8. Redirect ke login dengan pesan sukses
    navigate({ to: '/login', search: { registered: 'true' } })
  }

  // 9. Loading state saat validasi token
  if (isValidatingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memvalidasi token invite...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-50">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-zinc-400">
            Lengkapi form di bawah untuk membuat akun RuangAmbis
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Tampilkan Error */}
            {error && (
              <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Token (readonly, untuk transparansi) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Token Invite</label>
              <input
                type="text"
                value={token || ''}
                readOnly
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>

            {/* Email (pre-filled dari token) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.id"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="siswa_123"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
              <p className="text-xs text-zinc-500">Hanya huruf, angka, dan underscore</p>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nama Lengkap</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
            </div>

            {/* Nama Sekolah (opsional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Nama Sekolah <span className="text-zinc-500">(opsional)</span></label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="SMA Negeri 1 Jakarta"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Konfirmasi Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={isLoading || !isTokenValid}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isTokenValid}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Memproses...
                </span>
              ) : (
                'Daftar'
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-zinc-400 hover:text-white"
              onClick={() => navigate({ to: '/login' })}
            >
              Sudah punya akun? Login di sini
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}