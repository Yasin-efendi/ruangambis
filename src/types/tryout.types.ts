/**
 * Tipe data untuk sistem CBT (Computer-Based Test)
 * 
 * Mencerminkan struktur database:
 * - packages → Package
 * - subtests → Subtest
 * - questions → Question
 * - options_public → Option (tanpa is_correct)
 * - try_out_sessions → TryOutSession
 * - session_answers → SessionAnswer
 * - session_subtest_scores → SessionSubtestScore
 */

// ============================================================
// 1. PAKET TRY-OUT
// ============================================================
export interface Package {
  id: string
  title: string
  duration_min: number
  is_active: boolean
  created_at: string
}

// ============================================================
// 2. SUBTES
// ============================================================
export interface Subtest {
  id: string
  package_id: string
  title: string
  order_index: number
  created_at: string
}

// ============================================================
// 3. SOAL
// ============================================================
export interface Question {
  id: string
  subtest_id: string
  content: string // Mendukung markdown
  image_url: string | null
  order_index: number
  created_at: string
}

// ============================================================
// 4. PILIHAN JAWABAN
// Catatan: TIDAK ada is_correct di sini (aman dari client)
// Client query via view options_public
// ============================================================
export interface Option {
  id: string
  question_id: string
  label: 'A' | 'B' | 'C' | 'D' | 'E'
  content: string
}

// ============================================================
// 5. SESI TRY-OUT
// ============================================================
export type SessionStatus = 'in_progress' | 'submitted' | 'expired'

export interface TryOutSession {
  id: string
  user_id: string
  package_id: string
  status: SessionStatus
  started_at: string
  submitted_at: string | null
  time_remaining: number | null // Sisa detik (null jika belum mulai timer)
  score: number | null // Skor total (null jika belum submit)
  created_at: string
}

// ============================================================
// 6. JAWABAN PER SOAL
// ============================================================
export interface SessionAnswer {
  id: string
  session_id: string
  question_id: string
  option_id: string | null // null jika belum dijawab
  is_flagged: boolean // Flag "ragu-ragu"
  answered_at: string | null
}

// ============================================================
// 7. SKOR PER SUBTES
// ============================================================
export interface SessionSubtestScore {
  id: string
  session_id: string
  subtest_id: string
  total_questions: number
  correct_count: number
  score: number // Persentase (0-100)
}

// ============================================================
// 8. HASIL HITUNG SKOR (dari RPC calculate_score)
// ============================================================
export interface SubtestScoreDetail {
  subtest_id: string
  score: number
  correct: number
  total: number
}

export interface CalculateScoreResult {
  total_score: number
  correct_count: number
  total_questions: number
  subtest_scores: SubtestScoreDetail[]
}

// ============================================================
// 9. TIPE KOMPOSIT UNTUK UI
// ============================================================

/**
 * Paket dengan detail subtes dan jumlah soal
 * Digunakan di halaman daftar paket
 */
export interface PackageWithDetails extends Package {
  subtests: Subtest[]
  total_questions: number
}

/**
 * Soal dengan pilihan jawaban
 * Digunakan di halaman pengerjaan dan pembahasan
 */
export interface QuestionWithOptions extends Question {
  options: Option[]
}

/**
 * Sesi dengan detail paket dan jawaban
 * Digunakan di halaman hasil dan review
 */
export interface SessionWithDetails extends TryOutSession {
  package: Package
  subtests: Subtest[]
  answers: SessionAnswer[]
  subtest_scores: SessionSubtestScore[]
}

/**
 * Status pengerjaan soal (untuk UI state)
 */
export interface QuestionNavigationState {
  currentIndex: number
  answers: Map<string, string | null> // question_id → option_id
  flagged: Set<string> // question_id yang di-flag
}