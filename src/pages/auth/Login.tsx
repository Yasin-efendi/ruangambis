import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router' // <-- TAMBAHKAN useSearch
import { loginSchema } from '@/lib/validations/auth'
import { signInWithEmail } from '@/services/authService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const navigate = useNavigate()
  
  // <-- BARU: Baca parameter redirect dari URL
  const { redirect } = useSearch({ strict: false }) as { redirect?: string }
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = loginSchema.safeParse({ email, password })
    
    if (!result.success) {
      setError(result.error.errors[0].message)
      setIsLoading(false)
      return
    }

    const { user, error: authError } = await signInWithEmail(
      result.data.email,
      result.data.password
    )

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    if (user) {
      // <-- BARU: Redirect ke halaman asal atau / jika tidak ada redirect
      navigate({ to: redirect || '/' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-50">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Masuk ke RuangAmbis</CardTitle>
          <CardDescription className="text-zinc-400">
            Masukkan email dan password untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.id"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}