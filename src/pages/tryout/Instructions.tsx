import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { getPackageById } from '@/services/packageService'
import { createSession } from '@/services/sessionService'
import type { PackageWithDetails } from '@/types/tryout.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * InstructionsPage — Halaman instruksi try-out sebelum mulai mengerjakan soal
 * 
 * Menampilkan:
 * - Detail paket (judul, durasi, jumlah subtes & soal)
 * - Aturan try-out (tidak bisa pause, submit final, dll)
 * - Tombol "Mulai Try Out" yang membuat sesi baru dan redirect ke halaman pengerjaan
 */
export default function InstructionsPage() {
  const { packageId } = useParams({ strict: false }) as { packageId: string }
  const navigate = useNavigate()
  
  const [pkg, setPkg] = useState<PackageWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)

  // Fetch detail paket saat halaman dibuka
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const data = await getPackageById(packageId)
        
        if (!data) {
          setError('Paket try-out tidak ditemukan.')
          return
        }
        
        setPkg(data)
      } catch (err) {
        console.error('Error fetching package:', err)
        setError('Gagal memuat detail paket. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPackage()
  }, [packageId])

  // Handler: Mulai try-out
  const handleStart = async () => {
    if (!pkg) return

    try {
      setIsStarting(true)
      
      // 1. Buat sesi baru
      const session = await createSession(pkg.id)
      
      if (!session) {
        setError('Gagal memulai sesi try-out. Silakan coba lagi.')
        setIsStarting(false)
        return
      }
      
      // 2. Redirect ke halaman pengerjaan soal
      navigate({
        to: '/tryout/$sessionId/take',
        params: { sessionId: session.id },
      })
    } catch (err) {
      console.error('Error starting session:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setIsStarting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat instruksi...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !pkg) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error || 'Paket tidak ditemukan'}</p>
              <Link to="/tryout">
                <Button className="bg-red-600 hover:bg-red-500 text-white">
                  Kembali ke Daftar Paket
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/tryout"
            className="text-sm text-zinc-400 hover:text-white transition-colors mb-2 inline-block"
          >
            ← Kembali ke Daftar Paket
          </Link>
          <h1 className="text-3xl font-bold text-white">Instruksi Try Out</h1>
          <p className="text-zinc-400 mt-1">
            Baca dengan seksama sebelum memulai
          </p>
        </div>

        {/* Detail Paket */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">{pkg.title}</CardTitle>
            <CardDescription className="text-zinc-400">
              Detail paket try-out
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistik Paket */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-violet-400">
                  {pkg.duration_min}
                </div>
                <div className="text-xs text-zinc-500 uppercase">Menit</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-blue-400">
                  {pkg.subtests.length}
                </div>
                <div className="text-xs text-zinc-500 uppercase">Subtes</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-teal-400">
                  {pkg.total_questions}
                </div>
                <div className="text-xs text-zinc-500 uppercase">Soal</div>
              </div>
            </div>

            {/* Daftar Subtes */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <div className="text-sm font-semibold text-zinc-300">Subtes:</div>
              <ul className="space-y-2">
                {pkg.subtests.map((subtest, index) => (
                  <li
                    key={subtest.id}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{subtest.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Aturan Try Out */}
        <Card className="border-yellow-800/50 bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-300 text-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>Aturan Try Out</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-yellow-100/80">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 mt-0.5">•</span>
              <p>
                <strong>Durasi waktu:</strong> Kamu memiliki {pkg.duration_min} menit untuk mengerjakan semua soal. 
                Timer akan dimulai segera setelah kamu klik "Mulai Try Out".
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 mt-0.5">•</span>
              <p>
                <strong>Navigasi bebas:</strong> Kamu bisa berpindah antar soal dan mengubah jawaban kapan saja sebelum submit.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 mt-0.5">•</span>
              <p>
                <strong>Flag ragu-ragu:</strong> Gunakan fitur flag untuk menandai soal yang ingin kamu review nanti.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 mt-0.5">•</span>
              <p>
                <strong>Submit final:</strong> Setelah klik "Kumpulkan", jawaban tidak bisa diubah lagi. Pastikan semua soal sudah dijawab.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 mt-0.5">•</span>
              <p>
                <strong>Hasil & pembahasan:</strong> Setelah submit, kamu bisa langsung lihat skor dan pembahasan soal.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link to="/tryout" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              disabled={isStarting}
            >
              Batal
            </Button>
          </Link>
          <Button
            onClick={handleStart}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg"
            disabled={isStarting}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Memulai...
              </span>
            ) : (
              'Mulai Try Out →'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}