import { supabase } from '@/services/supabase'
import type { User } from '@supabase/supabase-js'

// Tipe data untuk hasil operasi auth agar konsisten
export interface AuthResponse {
  user: User | null
  error: Error | null
}

/**
 * Login menggunakan email dan password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return { user: data.user, error: null }
  } catch (err) {
    console.error('signInWithEmail error:', err)
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Terjadi kesalahan saat login') 
    }
  }
}

/**
 * Registrasi akun baru menggunakan email dan password
 * (Catatan: Validasi token invite akan ditambahkan di Fase 1B)
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Nanti kita bisa tambahkan data tambahan di sini, misal: username
        // data: { username: 'siswa123' }
      }
    })

    if (error) throw error

    return { user: data.user, error: null }
  } catch (err) {
    console.error('signUpWithEmail error:', err)
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Terjadi kesalahan saat registrasi') 
    }
  }
}

/**
 * Logout user dan hapus sesi
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return { error: null }
  } catch (err) {
    console.error('signOut error:', err)
    return { 
      error: err instanceof Error ? err : new Error('Terjadi kesalahan saat logout') 
    }
  }
}