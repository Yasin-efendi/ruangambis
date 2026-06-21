import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { getActivePackages } from '@/services/packageService'
import type { PackageWithDetails } from '@/types/tryout.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * PackagesPage — Halaman daftar paket try-out
 * 
 * Menampilkan semua paket aktif dengan detail:
 * - Judul paket
 * - Durasi (menit)
 * - Jumlah subtes
 * - Total soal
 * - Tombol "Mulai" → halaman instruksi
 */
export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const data = await getActivePackages()
        setPackages(data)
      } catch (err) {
        console.error('Error fetching packages:', err)
        setError('Gagal memuat daftar paket. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackages()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat daftar paket...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (packages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">📭</div>
              <h2 className="text-xl font-semibold text-white">Belum Ada Paket</h2>
              <p className="text-zinc-400">
                Tidak ada paket try-out yang tersedia saat ini. Silakan hubungi admin atau coba lagi nanti.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Paket Try Out</h1>
          <p className="text-zinc-400 mt-1">
            Pilih paket yang ingin kamu kerjakan
          </p>
        </div>

        {/* Grid Paket */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="border-zinc-800 bg-zinc-900 hover:border-violet-500/50 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-white text-lg line-clamp-2">
                  {pkg.title}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Paket try-out untuk latihan
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Detail Paket */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-violet-400">
                      {pkg.duration_min}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">Menit</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-400">
                      {pkg.subtests.length}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">Subtes</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-teal-400">
                      {pkg.total_questions}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">Soal</div>
                  </div>
                </div>

                {/* Daftar Subtes */}
                <div className="space-y-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide">
                    Subtes:
                  </div>
                  <ul className="space-y-1">
                    {pkg.subtests.map((subtest) => (
                      <li
                        key={subtest.id}
                        className="text-sm text-zinc-300 flex items-start gap-2"
                      >
                        <span className="text-violet-400 mt-0.5">•</span>
                        <span>{subtest.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tombol Mulai */}
                <Link
                  to="/tryout/$packageId/instructions"
                  params={{ packageId: pkg.id }}
                >
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
                    Mulai Try Out →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}