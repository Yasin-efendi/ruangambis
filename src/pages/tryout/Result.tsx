import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { getSession } from '@/services/sessionService'
import type { SessionWithDetails } from '@/types/tryout.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * ResultPage — Halaman hasil try-out setelah submit
 * 
 * Menampilkan:
 * - Skor total dengan warna berdasarkan performa
 * - Statistik: total soal, dijawab, benar, salah
 * - Breakdown skor per subtes
 * - Tombol "Lihat Pembahasan" dan "Kembali ke Dashboard"
 */
export default function ResultPage() {
  const { sessionId } = useParams({ strict: false }) as { sessionId: string }
//   const navigate = useNavigate()

  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch session data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getSession(sessionId)
        if (!data) {
          setError('Sesi try-out tidak ditemukan.')
          setIsLoading(false)
          return
        }

        // Pastikan sesi sudah di-submit
        if (data.status !== 'submitted') {
          setError('Sesi ini belum dikumpulkan.')
          setIsLoading(false)
          return
        }

        setSession(data)
      } catch (err) {
        console.error('Error fetching session:', err)
        setError('Gagal memuat hasil try-out. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [sessionId])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat hasil...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error || 'Data tidak ditemukan'}</p>
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

  // Derived data
  const score = session.score ?? 0
  const totalQuestions = session.subtest_scores.reduce((sum, s) => sum + s.total_questions, 0)
  const totalCorrect = session.subtest_scores.reduce((sum, s) => sum + s.correct_count, 0)
  const answeredCount = session.answers.filter((a) => a.option_id !== null).length
  const unansweredCount = totalQuestions - answeredCount

  // Warna berdasarkan skor
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-red-500/20 border-red-500/30'
  }

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Luar Biasa!'
    if (score >= 60) return 'Bagus!'
    if (score >= 40) return 'Cukup Baik'
    return 'Perlu Latihan Lagi'
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Hasil Try Out</h1>
          <p className="text-zinc-400 mt-1">{session.package.title}</p>
        </div>

        {/* Skor Total */}
        <Card className={`border-2 ${getScoreBgColor(score)}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-sm text-zinc-400 uppercase tracking-wide">Skor Total</div>
              <div className={`text-7xl font-bold ${getScoreColor(score)}`}>
                {score.toFixed(0)}
              </div>
              <div className="text-xl font-semibold text-white">
                {getPerformanceLabel(score)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-white">{totalQuestions}</div>
              <div className="text-xs text-zinc-500 uppercase mt-1">Total Soal</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-green-400">{totalCorrect}</div>
              <div className="text-xs text-zinc-500 uppercase mt-1">Benar</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-red-400">
                {answeredCount - totalCorrect}
              </div>
              <div className="text-xs text-zinc-500 uppercase mt-1">Salah</div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-zinc-400">{unansweredCount}</div>
              <div className="text-xs text-zinc-500 uppercase mt-1">Tidak Dijawab</div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Per Subtes */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">Breakdown Per Subtes</CardTitle>
            <CardDescription className="text-zinc-400">
              Performa kamu di setiap subtes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session.subtest_scores.map((subtestScore) => {
              const percentage = subtestScore.score
              const subtest = session.subtests.find((s) => s.id === subtestScore.subtest_id)
              const subtestTitle = subtest?.title || 'Subtes Tidak Dikenal'

              return (
                <div key={subtestScore.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{subtestTitle}</div>
                    <div className="text-sm text-zinc-400">
                      {subtestScore.correct_count} / {subtestScore.total_questions} benar
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className={`text-sm font-bold min-w-[3rem] text-right ${getScoreColor(percentage)}`}>
                      {percentage.toFixed(0)}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link to="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Kembali ke Dashboard
            </Button>
          </Link>
          <Link
            to="/tryout/$sessionId/review"
            params={{ sessionId }}
            className="flex-1"
          >
            <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold">
              Lihat Pembahasan →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}