import { supabase } from '@/services/supabase'

/**
 * Data sesi untuk analytics
 */
export interface SessionAnalytics {
  id: string
  package_title: string
  score: number
  total_questions: number
  correct_count: number
  submitted_at: string
  subtest_scores: {
    subtest_title: string
    score: number
    correct_count: number
    total_questions: number
  }[]
}

/**
 * Ringkasan statistik analytics
 */
export interface AnalyticsSummary {
  total_sessions: number
  average_score: number
  highest_score: number
  weakest_subtest: string | null
}

/**
 * Ambil semua sesi try-out yang sudah di-submit untuk user yang login
 * Include: detail paket, skor, dan breakdown per subtes
 * 
 * @returns Array of SessionAnalytics (diurutkan dari terbaru)
 */
export async function getUserSessions(): Promise<SessionAnalytics[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return []
    }

    // 1. Query semua sesi yang sudah di-submit
    const { data: sessions, error: sessionsError } = await supabase
      .from('try_out_sessions')
      .select(`
        id,
        package_id,
        score,
        submitted_at,
        package:packages (
          id,
          title,
          subtests (
            id,
            title
          )
        ),
        subtest_scores:session_subtest_scores (
          subtest_id,
          score,
          correct_count,
          total_questions
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      return []
    }

    if (!sessions || sessions.length === 0) {
      return []
    }

    // 2. Transform data ke format yang lebih mudah dipakai
    return sessions.map((session) => {
      const pkg = session.package as any
      const subtests = pkg.subtests || []
      const subtestScores = session.subtest_scores || []

      // Hitung total soal dari subtest_scores
      const totalQuestions = subtestScores.reduce(
        (sum: number, s: any) => sum + s.total_questions,
        0
      )
      const correctCount = subtestScores.reduce(
        (sum: number, s: any) => sum + s.correct_count,
        0
      )

      // Map subtest_scores dengan judul subtes
      const subtestDetails = subtestScores.map((score: any) => {
        const subtest = subtests.find((s: any) => s.id === score.subtest_id)
        return {
          subtest_title: subtest?.title || 'Subtes Tidak Dikenal',
          score: score.score,
          correct_count: score.correct_count,
          total_questions: score.total_questions,
        }
      })

      return {
        id: session.id,
        package_title: pkg.title || 'Paket Tidak Dikenal',
        score: session.score || 0,
        total_questions: totalQuestions,
        correct_count: correctCount,
        submitted_at: session.submitted_at,
        subtest_scores: subtestDetails,
      }
    })
  } catch (err) {
    console.error('getUserSessions error:', err)
    return []
  }
}

/**
 * Hitung ringkasan statistik dari data sesi
 * 
 * @param sessions - Array sesi yang sudah di-fetch
 * @returns AnalyticsSummary
 */
export function calculateSummary(sessions: SessionAnalytics[]): AnalyticsSummary {
  if (sessions.length === 0) {
    return {
      total_sessions: 0,
      average_score: 0,
      highest_score: 0,
      weakest_subtest: null,
    }
  }

  // Total sesi
  const totalSessions = sessions.length

  // Rata-rata skor
  const averageScore =
    sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions

  // Skor tertinggi
  const highestScore = Math.max(...sessions.map((s) => s.score))

  // Subtes terlemah (rata-rata skor terendah)
  const subtestMap = new Map<string, { total: number; count: number }>()
  
  for (const session of sessions) {
    for (const subtest of session.subtest_scores) {
      const existing = subtestMap.get(subtest.subtest_title) || { total: 0, count: 0 }
      existing.total += subtest.score
      existing.count += 1
      subtestMap.set(subtest.subtest_title, existing)
    }
  }

  let weakestSubtest: string | null = null
  let lowestAverage = Infinity

  for (const [title, data] of subtestMap.entries()) {
    const avg = data.total / data.count
    if (avg < lowestAverage) {
      lowestAverage = avg
      weakestSubtest = title
    }
  }

  return {
    total_sessions: totalSessions,
    average_score: averageScore,
    highest_score: highestScore,
    weakest_subtest: weakestSubtest,
  }
}