import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts'
import { getUserSessions, calculateSummary } from '@/services/analyticsService'
import type { SessionAnalytics, AnalyticsSummary } from '@/services/analyticsService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * AnalyticsPage — Halaman analitik perkembangan try-out
 * 
 * Menampilkan:
 * - Ringkasan statistik (total sesi, rata-rata, tertinggi, subtes terlemah)
 * - Grafik perkembangan skor dari waktu ke waktu
 * - Performa rata-rata per subtes
 * - Riwayat sesi try-out
 */
export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<SessionAnalytics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getUserSessions()
        setSessions(data)
        setSummary(calculateSummary(data))
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Gagal memuat data analytics. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat analytics...</span>
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

  // Empty state — user belum pernah try-out
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Analitik Saya</h1>
            <p className="text-zinc-400 mt-1">
              Pantau perkembangan belajarmu dari waktu ke waktu
            </p>
          </div>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4 max-w-md mx-auto">
                <div className="text-6xl">📊</div>
                <h2 className="text-2xl font-bold text-white">
                  Belum Ada Data Analytics
                </h2>
                <p className="text-zinc-400">
                  Kamu belum pernah mengerjakan try-out. Mulai try-out pertamamu untuk melihat
                  perkembangan belajarmu di sini!
                </p>
                <Link to="/tryout">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold mt-2">
                    Mulai Try Out Sekarang →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ============================================================
  // Data untuk grafik
  // ============================================================

  // Data line chart: skor per sesi (urut dari lama ke baru)
  const progressData = [...sessions]
    .reverse()
    .map((s, idx) => ({
      name: `Sesi ${idx + 1}`,
      score: s.score,
      date: new Date(s.submitted_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }),
    }))

  // Data bar chart: rata-rata skor per subtes
  const subtestMap = new Map<string, { total: number; count: number }>()
  for (const session of sessions) {
    for (const subtest of session.subtest_scores) {
      const existing = subtestMap.get(subtest.subtest_title) || { total: 0, count: 0 }
      existing.total += subtest.score
      existing.count += 1
      subtestMap.set(subtest.subtest_title, existing)
    }
  }
  const subtestPerformanceData = Array.from(subtestMap.entries()).map(([title, data]) => ({
    name: title.length > 20 ? title.slice(0, 17) + '...' : title,
    fullName: title,
    score: Math.round(data.total / data.count),
  }))

  // Helper: format tanggal
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Helper: warna skor
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Custom tooltip untuk chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
          <p className="text-xs text-zinc-400 mb-1">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Analitik Saya</h1>
          <p className="text-zinc-400 mt-1">
            Pantau perkembangan belajarmu dari waktu ke waktu
          </p>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/20 text-violet-400">
                  📝
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {summary?.total_sessions || 0}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">Total Sesi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400">
                  📈
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getScoreColor(summary?.average_score || 0)}`}>
                    {(summary?.average_score || 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">Rata-rata</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 text-green-400">
                  🏆
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getScoreColor(summary?.highest_score || 0)}`}>
                    {summary?.highest_score || 0}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">Tertinggi</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-400">
                  🎯
                </div>
                <div>
                  <div className="text-sm font-bold text-white truncate max-w-[120px]" title={summary?.weakest_subtest || '-'}>
                    {summary?.weakest_subtest || '-'}
                  </div>
                  <div className="text-xs text-zinc-500 uppercase">Perlu Latihan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grafik Perkembangan */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">Perkembangan Skor</CardTitle>
            <CardDescription className="text-zinc-400">
              Grafik skor total kamu dari waktu ke waktu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="transparent"
                    fill="url(#colorScore)"
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Skor"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7, fill: '#a78bfa' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performa Per Subtes */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">Performa Per Subtes</CardTitle>
            <CardDescription className="text-zinc-400">
              Rata-rata skor kamu di setiap subtes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subtestPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    style={{ fontSize: '11px' }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="score"
                    name="Rata-rata Skor"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Riwayat Sesi */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">Riwayat Try Out</CardTitle>
            <CardDescription className="text-zinc-400">
              Daftar sesi try-out yang pernah kamu kerjakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-500/20 text-violet-300 font-bold flex-shrink-0">
                      #{sessions.length - idx}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">
                        {session.package_title}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {formatDate(session.submitted_at)}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {session.correct_count} / {session.total_questions} benar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getScoreColor(session.score)}`}>
                      {session.score.toFixed(0)}
                    </div>
                    <Link
                      to="/tryout/$sessionId/review"
                      params={{ sessionId: session.id }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      >
                        Lihat
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}