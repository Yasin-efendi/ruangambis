import { supabase } from '@/services/supabase'
import type {
  TryOutSession,
  SessionAnswer,
  SessionWithDetails,
  QuestionWithOptions,
  CalculateScoreResult,
} from '@/types/tryout.types'

/**
 * Mulai sesi try-out baru untuk user yang sedang login
 * 
 * @param packageId - ID paket yang akan dikerjakan
 * @returns Session yang baru dibuat, atau null jika gagal
 */
export async function createSession(
  packageId: string
): Promise<TryOutSession | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await supabase
      .from('try_out_sessions')
      .insert({
        user_id: user.id,
        package_id: packageId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return null
    }

    return data as TryOutSession
  } catch (err) {
    console.error('createSession error:', err)
    return null
  }
}

/**
 * Ambil detail sesi lengkap (package, subtests, answers, scores)
 * 
 * @param sessionId - ID sesi yang ingin diambil
 * @returns SessionWithDetails jika ditemukan, null jika tidak ada
 */
export async function getSession(
  sessionId: string
): Promise<SessionWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('try_out_sessions')
      .select(`
        id,
        user_id,
        package_id,
        status,
        started_at,
        submitted_at,
        time_remaining,
        score,
        created_at,
        package:packages (
          id,
          title,
          duration_min,
          is_active,
          created_at,
          subtests (
            id,
            package_id,
            title,
            order_index,
            created_at
          )
        ),
        answers:session_answers (
          id,
          session_id,
          question_id,
          option_id,
          is_flagged,
          answered_at
        ),
        subtest_scores:session_subtest_scores (
          id,
          session_id,
          subtest_id,
          total_questions,
          correct_count,
          score
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching session:', error)
      return null
    }

    if (!data) return null

    // Transform nested data ke tipe SessionWithDetails
    const pkg = data.package as any
    return {
      id: data.id,
      user_id: data.user_id,
      package_id: data.package_id,
      status: data.status,
      started_at: data.started_at,
      submitted_at: data.submitted_at,
      time_remaining: data.time_remaining,
      score: data.score,
      created_at: data.created_at,
      package: {
        id: pkg.id,
        title: pkg.title,
        duration_min: pkg.duration_min,
        is_active: pkg.is_active,
        created_at: pkg.created_at,
      },
      subtests: pkg.subtests || [],
      answers: (data.answers || []) as SessionAnswer[],
      subtest_scores: (data.subtest_scores || []),
    }
  } catch (err) {
    console.error('getSession error:', err)
    return null
  }
}

/**
 * Ambil semua soal dalam paket beserta pilihan jawabannya
 * PENTING: Query opsi dari view options_public (aman, tanpa is_correct)
 * 
 * @param packageId - ID paket
 * @returns Array soal dengan opsi, diurutkan berdasarkan subtes dan order
 */
export async function getQuestionsWithOptions(
  packageId: string
): Promise<QuestionWithOptions[]> {
  try {
    // 1. Ambil semua subtes dalam paket
    const { data: subtests, error: subtestsError } = await supabase
      .from('subtests')
      .select('id')
      .eq('package_id', packageId)
      .order('order_index', { ascending: true })

    if (subtestsError || !subtests) {
      console.error('Error fetching subtests:', subtestsError)
      return []
    }

    const subtestIds = subtests.map(s => s.id)
    if (subtestIds.length === 0) return []

    // 2. Ambil semua soal dalam subtes-subtes tersebut
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        subtest_id,
        content,
        image_url,
        order_index,
        created_at
      `)
      .in('subtest_id', subtestIds)
      .order('subtest_id', { ascending: true })
      .order('order_index', { ascending: true })

    if (questionsError || !questions) {
      console.error('Error fetching questions:', questionsError)
      return []
    }

    if (questions.length === 0) return []

    // 3. Ambil opsi dari view AMAN (options_public)
    const questionIds = questions.map(q => q.id)
    const { data: options, error: optionsError } = await supabase
      .from('options_public') // <-- PENTING: pakai view, bukan tabel options
      .select('id, question_id, label, content')
      .in('question_id', questionIds)
      .order('label', { ascending: true })

    if (optionsError) {
      console.error('Error fetching options:', optionsError)
      return []
    }

    // 4. Group opsi per soal
    const optionsByQuestion = new Map<string, any[]>()
    for (const opt of options || []) {
      const arr = optionsByQuestion.get(opt.question_id) || []
      arr.push(opt)
      optionsByQuestion.set(opt.question_id, arr)
    }

    // 5. Gabungkan soal dengan opsinya
    return questions.map(q => ({
      id: q.id,
      subtest_id: q.subtest_id,
      content: q.content,
      image_url: q.image_url,
      order_index: q.order_index,
      created_at: q.created_at,
      options: optionsByQuestion.get(q.id) || [],
    }))
  } catch (err) {
    console.error('getQuestionsWithOptions error:', err)
    return []
  }
}

/**
 * Simpan atau update jawaban user untuk satu soal
 * Menggunakan upsert untuk menghindari duplikasi (UNIQUE constraint)
 * 
 * @param sessionId - ID sesi
 * @param questionId - ID soal
 * @param optionId - ID opsi yang dipilih (null untuk hapus jawaban)
 */
export async function saveAnswer(
  sessionId: string,
  questionId: string,
  optionId: string | null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('session_answers')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          option_id: optionId,
          answered_at: optionId ? new Date().toISOString() : null,
        },
        {
          onConflict: 'session_id,question_id',
        }
      )

    if (error) {
      console.error('Error saving answer:', error)
      return false
    }

    // Update last_synced_at di sesi (untuk resume strategy di Fase 2B)
    await supabase
      .from('try_out_sessions')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', sessionId)

    return true
  } catch (err) {
    console.error('saveAnswer error:', err)
    return false
  }
}

/**
 * Toggle flag "ragu-ragu" untuk satu soal
 * 
 * @param sessionId - ID sesi
 * @param questionId - ID soal
 * @param isFlagged - true untuk flag, false untuk unflag
 */
export async function toggleFlag(
  sessionId: string,
  questionId: string,
  isFlagged: boolean
): Promise<boolean> {
  try {
    // Pastikan record answer ada dulu (mungkin user belum jawab tapi sudah flag)
    const { data: existing } = await supabase
      .from('session_answers')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .maybeSingle()

    if (!existing) {
      // Buat record baru dengan is_flagged = true, option_id = null
      const { error } = await supabase
        .from('session_answers')
        .insert({
          session_id: sessionId,
          question_id: questionId,
          option_id: null,
          is_flagged: isFlagged,
        })

      if (error) {
        console.error('Error creating flagged answer:', error)
        return false
      }
    } else {
      // Update flag di record yang sudah ada
      const { error } = await supabase
        .from('session_answers')
        .update({ is_flagged: isFlagged })
        .eq('session_id', sessionId)
        .eq('question_id', questionId)

      if (error) {
        console.error('Error toggling flag:', error)
        return false
      }
    }

    return true
  } catch (err) {
    console.error('toggleFlag error:', err)
    return false
  }
}

/**
 * Submit sesi try-out dan hitung skor via RPC
 * 
 * @param sessionId - ID sesi yang akan di-submit
 * @returns Hasil perhitungan skor, atau null jika gagal
 */
export async function submitSession(
  sessionId: string
): Promise<CalculateScoreResult | null> {
  try {
    const { data, error } = await supabase.rpc('calculate_score', {
      p_session_id: sessionId,
    })

    if (error) {
      console.error('Error submitting session:', error)
      return null
    }

    return data as CalculateScoreResult
  } catch (err) {
    console.error('submitSession error:', err)
    return null
  }
}