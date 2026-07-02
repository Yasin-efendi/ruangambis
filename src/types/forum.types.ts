/**
 * Tipe data untuk sistem Forum Diskusi
 * 
 * Mencerminkan struktur database:
 * - posts → Post
 * - comments → Comment
 * - profiles → untuk info user (username)
 */

// ============================================================
// 1. POST DISKUSI
// ============================================================
export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  package_id: string | null
  subtest_id: string | null
  question_id: string | null
  is_resolved: boolean
  comments_count: number
  created_at: string
  updated_at: string
}

// ============================================================
// 2. KOMENTAR
// ============================================================
export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// ============================================================
// 3. POST + INFO USER (untuk UI)
// ============================================================
export interface PostWithUser extends Post {
  user: {
    username: string
    role: 'admin' | 'student'
  }
}

// ============================================================
// 4. COMMENT + INFO USER (untuk UI)
// ============================================================
export interface CommentWithUser extends Comment {
  user: {
    username: string
    role: 'admin' | 'student'
  }
}

// ============================================================
// 5. INPUT UNTUK CREATE POST
// ============================================================
export interface CreatePostInput {
  title: string
  content: string
  package_id?: string | null
  subtest_id?: string | null
  question_id?: string | null
}

// ============================================================
// 6. INPUT UNTUK CREATE COMMENT
// ============================================================
export interface CreateCommentInput {
  post_id: string
  content: string
}