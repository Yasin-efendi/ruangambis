import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  getSession,
  getQuestionsWithOptions,
  saveAnswer,
  toggleFlag,
  submitSession,
} from '@/services/sessionService'
import type { SessionWithDetails, QuestionWithOptions } from '@/types/tryout.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================
// SUB-COMPONENT: QuestionCard
// Menampilkan satu soal dengan pilihan jawaban A-E
// ============================================================
function QuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  isFlagged,
  onSelectOption,
  onToggleFlag,
}: {
  question: QuestionWithOptions
  questionNumber: number
  selectedOptionId: string | null
  isFlagged: boolean
  onSelectOption: (optionId: string) => void
  onToggleFlag: () => void
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <span className="flex items-center justify-center min-w-[2.5rem] h-10 rounded-lg bg-violet-500/20 text-violet-300 font-bold">
              {questionNumber}
            </span>
            <p className="text-white leading-relaxed whitespace-pre-wrap pt-1">
              {question.content}
            </p>
          </div>
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors flex-shrink-0 ${
              isFlagged
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
            }`}
            title={isFlagged ? 'Hapus tanda ragu-ragu' : 'Tandai ragu-ragu'}
          >
            <span>{isFlagged ? '🚩' : '⚑'}</span>
            <span className="hidden sm:inline">{isFlagged ? 'Ditandai' : 'Ragu'}</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id
          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`w-full text-left p-3 rounded-md border transition-all ${
                isSelected
                  ? 'bg-violet-500/20 border-violet-500 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold flex-shrink-0 ${
                    isSelected ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {option.label}
                </span>
                <span className="pt-0.5">{option.content}</span>
              </div>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ============================================================
// SUB-COMPONENT: QuestionNav
// Panel nomor soal dengan status warna
// ============================================================
function QuestionNav({
  questions,
  answers,
  flagged,
  currentIndex,
  onSelect,
}: {
  questions: QuestionWithOptions[]
  answers: Map<string, string | null>
  flagged: Set<string>
  currentIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-white text-sm">Navigasi Soal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers.has(q.id) && answers.get(q.id) !== null
            const isFlagged = flagged.has(q.id)
            const isCurrent = idx === currentIndex

            // Prioritas warna: current > flagged > answered > default
            let bgColor = 'bg-zinc-800 text-zinc-400 border-zinc-700'
            if (isAnswered) bgColor = 'bg-green-500/20 text-green-300 border-green-500/30'
            if (isFlagged) bgColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'

            return (
              <button
                key={q.id}
                onClick={() => onSelect(idx)}
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
            <div className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700"></div>
            <span className="text-zinc-400">Belum dijawab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
            <span className="text-zinc-400">Sudah dijawab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
            <span className="text-zinc-400">Ragu-ragu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-zinc-800 border-2 border-violet-500"></div>
            <span className="text-zinc-400">Soal aktif</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================
// SUB-COMPONENT: SubmitModal
// Modal konfirmasi sebelum submit
// ============================================================
function SubmitModal({
  totalQuestions,
  answeredCount,
  flaggedCount,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  totalQuestions: number
  answeredCount: number
  flaggedCount: number
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const unansweredCount = totalQuestions - answeredCount

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white text-xl">Kumpulkan Jawaban?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-zinc-300">
            Pastikan kamu sudah memeriksa semua jawaban sebelum mengumpulkan. Setelah dikumpulkan, jawaban{' '}
            <strong>tidak dapat diubah</strong>.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
              <div className="text-2xl font-bold text-white">{totalQuestions}</div>
              <div className="text-xs text-zinc-500">Total Soal</div>
            </div>
            <div className="rounded-lg bg-green-950/30 p-3 border border-green-800/50">
              <div className="text-2xl font-bold text-green-400">{answeredCount}</div>
              <div className="text-xs text-zinc-500">Dijawab</div>
            </div>
            <div className="rounded-lg bg-yellow-950/30 p-3 border border-yellow-800/50">
              <div className="text-2xl font-bold text-yellow-400">{flaggedCount}</div>
              <div className="text-xs text-zinc-500">Ragu-ragu</div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="rounded-md bg-red-950/30 border border-red-800/50 p-3 text-sm text-red-300">
              ⚠️ Kamu masih memiliki <strong>{unansweredCount} soal</strong> yang belum dijawab.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
              disabled={isSubmitting}
            >
              Periksa Lagi
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Mengumpulkan...
                </span>
              ) : (
                'Kumpulkan'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT: TakePage
// ============================================================
export default function TakePage() {
  const { sessionId } = useParams({ strict: false }) as { sessionId: string }
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string | null>>(new Map())
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Ref untuk debounce save jawaban
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ============================================================
  // Fetch data saat halaman dibuka
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 1. Fetch session (include package_id)
        const sessionData = await getSession(sessionId)
        if (!sessionData) {
          setError('Sesi try-out tidak ditemukan.')
          setIsLoading(false)
          return
        }

        // Cek apakah sesi sudah di-submit
        if (sessionData.status === 'submitted') {
          navigate({
            to: '/tryout/$sessionId/result',
            params: { sessionId },
          })
          return
        }

        setSession(sessionData)

        // 2. Fetch soal + opsi berdasarkan package_id
        const questionsData = await getQuestionsWithOptions(sessionData.package_id)
        if (questionsData.length === 0) {
          setError('Tidak ada soal dalam paket ini.')
          setIsLoading(false)
          return
        }
        setQuestions(questionsData)

        // 3. Initialize answers & flagged dari data sesi (untuk resume)
        const answersMap = new Map<string, string | null>()
        const flaggedSet = new Set<string>()
        for (const ans of sessionData.answers) {
          if (ans.option_id) {
            answersMap.set(ans.question_id, ans.option_id)
          }
          if (ans.is_flagged) {
            flaggedSet.add(ans.question_id)
          }
        }
        setAnswers(answersMap)
        setFlagged(flaggedSet)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Gagal memuat data sesi. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [sessionId, navigate])

  // ============================================================
  // Handler: Pilih opsi jawaban (dengan debounce)
  // ============================================================
  const handleSelectOption = useCallback(
    (questionId: string, optionId: string) => {
      // 1. Update state lokal (optimistic update)
      setAnswers((prev) => {
        const next = new Map(prev)
        next.set(questionId, optionId)
        return next
      })

      // 2. Debounced save ke backend (500ms setelah klik terakhir)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(async () => {
        const success = await saveAnswer(sessionId, questionId, optionId)
        if (!success) {
          console.error('Failed to save answer for question:', questionId)
        }
      }, 500)
    },
    [sessionId]
  )

  // ============================================================
  // Handler: Toggle flag ragu-ragu
  // ============================================================
  const handleToggleFlag = useCallback(
    (questionId: string) => {
      const newIsFlagged = !flagged.has(questionId)

      // 1. Update state lokal
      setFlagged((prev) => {
        const next = new Set(prev)
        if (newIsFlagged) {
          next.add(questionId)
        } else {
          next.delete(questionId)
        }
        return next
      })

      // 2. Save ke backend (tanpa debounce, flag jarang di-toggle cepat)
      toggleFlag(sessionId, questionId, newIsFlagged).then((success) => {
        if (!success) {
          console.error('Failed to toggle flag for question:', questionId)
        }
      })
    },
    [flagged, sessionId]
  )

  // ============================================================
  // Handler: Submit sesi
  // ============================================================
  const handleSubmit = async () => {
    setIsSubmitting(true)
    const result = await submitSession(sessionId)

    if (!result) {
      setError('Gagal mengumpulkan jawaban. Silakan coba lagi.')
      setIsSubmitting(false)
      setShowSubmitModal(false)
      return
    }

    // Redirect ke halaman hasil
    navigate({
      to: '/tryout/$sessionId/result',
      params: { sessionId },
    })
  }

  // ============================================================
  // Loading state
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat soal...</span>
        </div>
      </div>
    )
  }

  // ============================================================
  // Error state
  // ============================================================
  if (error || !session || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error || 'Data tidak lengkap'}</p>
              <Button
                onClick={() => navigate({ to: '/tryout' })}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Kembali ke Daftar Paket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================
  // Derived state
  // ============================================================
  const currentQuestion = questions[currentIndex]
  const selectedOptionId = answers.get(currentQuestion.id) || null
  const isCurrentFlagged = flagged.has(currentQuestion.id)
  const answeredCount = Array.from(answers.values()).filter((v) => v !== null).length

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 text-zinc-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-xl font-bold text-white">{session.package.title}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Soal {currentIndex + 1} dari {questions.length}
            </p>
          </div>
          <Button
            onClick={() => setShowSubmitModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            Kumpulkan Jawaban
          </Button>
        </div>

        {/* Main Content: 2 kolom di desktop, 1 kolom di mobile */}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Kolom Kiri: Soal */}
          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedOptionId={selectedOptionId}
              isFlagged={isCurrentFlagged}
              onSelectOption={(optionId) => handleSelectOption(currentQuestion.id, optionId)}
              onToggleFlag={() => handleToggleFlag(currentQuestion.id)}
            />

            {/* Tombol Navigasi Bawah */}
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

          {/* Kolom Kanan: Navigasi Soal */}
          <div className="space-y-4">
            <QuestionNav
              questions={questions}
              answers={answers}
              flagged={flagged}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />

            {/* Info Progress */}
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Dijawab</span>
                    <span className="text-white font-semibold">
                      {answeredCount} / {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-violet-500 h-full transition-all duration-300"
                      style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Submit */}
      {showSubmitModal && (
        <SubmitModal
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          flaggedCount={flagged.size}
          onConfirm={handleSubmit}
          onCancel={() => setShowSubmitModal(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}