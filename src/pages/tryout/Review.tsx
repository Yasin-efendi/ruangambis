import { useEffect, useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { supabase } from '@/services/supabase'
import type { SessionReviewData, QuestionWithOptionsCorrect, SessionAnswer } from '@/types/tryout.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * ReviewPage — Halaman pembahasan soal setelah submit
 * 
 * Menampilkan:
 * - Semua soal dengan jawaban user
 * - Jawaban benar ditandai hijau
 * - Jawaban salah ditandai merah
 * - Soal yang tidak dijawab ditandai abu-abu
 * - Navigasi antar soal (prev/next)
 * - Panel nomor soal dengan status warna
 */
export default function ReviewPage() {
  const { sessionId } = useParams({ strict: false }) as { sessionId: string }

  const [reviewData, setReviewData] = useState<SessionReviewData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch review data via RPC
  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: rpcError } = await supabase.rpc('get_session_review', {
          p_session_id: sessionId,
        })

        if (rpcError) {
          console.error('RPC error:', rpcError)
          setError('Gagal memuat pembahasan. Silakan coba lagi.')
          setIsLoading(false)
          return
        }

        if (!data) {
          setError('Data pembahasan tidak ditemukan.')
          setIsLoading(false)
          return
        }

        setReviewData(data as SessionReviewData)
      } catch (err) {
        console.error('Error fetching review:', err)
        setError('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReview()
  }, [sessionId])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat pembahasan...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !reviewData) {
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
  const { questions, answers } = reviewData
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.find((a) => a.question_id === currentQuestion.id)
  const selectedOptionId = currentAnswer?.option_id || null

  // Helper: Cek status jawaban untuk satu soal
  const getQuestionStatus = (question: QuestionWithOptionsCorrect, answer?: SessionAnswer) => {
    if (!answer || !answer.option_id) return 'unanswered'
    
    const selectedOption = question.options.find((o) => o.id === answer.option_id)
    if (!selectedOption) return 'unanswered'
    
    return selectedOption.is_correct ? 'correct' : 'wrong'
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-bold text-white">Pembahasan Soal</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Soal {currentIndex + 1} dari {questions.length}
            </p>
          </div>
          <Link to="/tryout/$sessionId/result" params={{ sessionId }}>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
              ← Kembali ke Hasil
            </Button>
          </Link>
        </div>

        {/* Main Content: 2 kolom di desktop */}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Kolom Kiri: Soal + Pembahasan */}
          <div className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader className="border-b border-zinc-800">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center min-w-[2.5rem] h-10 rounded-lg bg-violet-500/20 text-violet-300 font-bold">
                    {currentIndex + 1}
                  </span>
                  <p className="text-white leading-relaxed whitespace-pre-wrap pt-1 flex-1">
                    {currentQuestion.content}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id
                  const isCorrect = option.is_correct
                  const isWrongSelected = isSelected && !isCorrect

                  // Warna berdasarkan status
                  let bgColor = 'bg-zinc-950 border-zinc-800 text-zinc-300'
                  let iconBg = 'bg-zinc-800 text-zinc-400'
                  let icon: string = option.label

                  if (isCorrect) {
                    bgColor = 'bg-green-500/20 border-green-500 text-white'
                    iconBg = 'bg-green-500 text-white'
                    icon = '✓'
                  } else if (isWrongSelected) {
                    bgColor = 'bg-red-500/20 border-red-500 text-white'
                    iconBg = 'bg-red-500 text-white'
                    icon = '✗'
                  }

                  return (
                    <div
                      key={option.id}
                      className={`w-full text-left p-3 rounded-md border ${bgColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold flex-shrink-0 ${iconBg}`}
                        >
                          {icon}
                        </span>
                        <span className="pt-0.5">{option.content}</span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Status Jawaban */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-4">
                {(() => {
                  const status = getQuestionStatus(currentQuestion, currentAnswer)
                  if (status === 'correct') {
                    return (
                      <div className="flex items-center gap-2 text-green-400">
                        <span className="text-2xl">✅</span>
                        <div>
                          <div className="font-semibold">Jawaban Benar!</div>
                          <div className="text-sm text-green-300/70">Kamu memilih jawaban yang tepat</div>
                        </div>
                      </div>
                    )
                  } else if (status === 'wrong') {
                    return (
                      <div className="flex items-center gap-2 text-red-400">
                        <span className="text-2xl">❌</span>
                        <div>
                          <div className="font-semibold">Jawaban Salah</div>
                          <div className="text-sm text-red-300/70">Jawaban benar ditandai hijau</div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span className="text-2xl">⚪</span>
                        <div>
                          <div className="font-semibold">Tidak Dijawab</div>
                          <div className="text-sm text-zinc-500">Kamu tidak memilih jawaban untuk soal ini</div>
                        </div>
                      </div>
                    )
                  }
                })()}
              </CardContent>
            </Card>

            {/* Tombol Navigasi */}
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                variant="outline"
                className="flex-1 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                ← Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
              >
                Selanjutnya →
              </Button>
            </div>
          </div>

          {/* Kolom Kanan: Panel Navigasi */}
          <div className="space-y-4">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-white text-sm">Navigasi Soal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const answer = answers.find((a) => a.question_id === q.id)
                    const status = getQuestionStatus(q, answer)
                    const isCurrent = idx === currentIndex

                    let bgColor = 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    if (status === 'correct') bgColor = 'bg-green-500/20 text-green-300 border-green-500/30'
                    if (status === 'wrong') bgColor = 'bg-red-500/20 text-red-300 border-red-500/30'
                    if (status === 'unanswered') bgColor = 'bg-zinc-800 text-zinc-500 border-zinc-700'

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`aspect-square rounded-md text-sm font-semibold border transition-all ${bgColor} ${
                          isCurrent ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-zinc-900' : ''
                        } hover:scale-105`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
                    <span className="text-zinc-400">Benar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div>
                    <span className="text-zinc-400">Salah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700"></div>
                    <span className="text-zinc-400">Tidak dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-800 border-2 border-violet-500"></div>
                    <span className="text-zinc-400">Soal aktif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistik Singkat */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Benar</span>
                    <span className="text-green-400 font-semibold">
                      {answers.filter((a) => {
                        const q = questions.find((q) => q.id === a.question_id)
                        return q && a.option_id && q.options.find((o) => o.id === a.option_id)?.is_correct
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Salah</span>
                    <span className="text-red-400 font-semibold">
                      {answers.filter((a) => {
                        const q = questions.find((q) => q.id === a.question_id)
                        return q && a.option_id && !q.options.find((o) => o.id === a.option_id)?.is_correct
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tidak dijawab</span>
                    <span className="text-zinc-500 font-semibold">
                      {questions.length - answers.filter((a) => a.option_id !== null).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}