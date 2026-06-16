/**
 * Tipe data untuk tabel `profiles` di Supabase
 * 
 * Catatan:
 * - `id` sama dengan `auth.users.id` (foreign key)
 * - Semua timestamp direpresentasikan sebagai string (ISO 8601)
 * - Field nullable ditandai dengan `| null`
 */
export interface Profile {
  id: string
  username: string
  full_name: string | null
  role: 'admin' | 'student'
  school_name: string | null
  status: 'active' | 'suspended'
  invited_by: string | null
  created_at: string
}

/**
 * Tipe data untuk form edit profil
 * Hanya field yang bisa diedit oleh user
 */
export interface ProfileUpdateInput {
  full_name?: string
  school_name?: string
  username?: string
}

/**
 * Role user — digunakan untuk type guard dan conditional rendering
 */
export type UserRole = Profile['role']

/**
 * Status user — digunakan untuk validasi akses
 */
export type UserStatus = Profile['status']