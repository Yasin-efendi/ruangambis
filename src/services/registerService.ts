import { supabase } from '@/services/supabase'
import type { RegisterInput } from '@/lib/validations/register'

export interface RegisterResponse {
  success: boolean
  message: string
  error?: Error
}

export async function registerWithInvite(data: RegisterInput): Promise<RegisterResponse> {
  try {
    // 1. Validasi token di database
    const { data: invite, error: inviteError } = await supabase
      .from('invitations')
      .select('id, email, created_by, expires_at, used_at')
      .eq('token', data.token)
      .single()

    if (inviteError || !invite) {
      return { success: false, message: 'Token invite tidak valid atau tidak ditemukan.' }
    }

    if (invite.used_at) {
      return { success: false, message: 'Token invite ini sudah digunakan.' }
    }

    if (new Date(invite.expires_at) < new Date()) {
      return { success: false, message: 'Token invite sudah kedaluwarsa.' }
    }

    if (invite.email.toLowerCase() !== data.email.toLowerCase()) {
      return { success: false, message: 'Email yang didaftarkan harus sama dengan email penerima invite.' }
    }

    // 2. Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          full_name: data.fullName, // <-- DIPERBAIKI: mapping dari camelCase
        }
      }
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        return { success: false, message: 'Email ini sudah terdaftar. Silakan login.' }
      }
      return { success: false, message: authError.message, error: authError }
    }

    if (!authData.user) {
      return { success: false, message: 'Gagal membuat akun. Silakan coba lagi.' }
    }

    // 3. Insert data ke tabel profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: data.username,
      full_name: data.fullName,       // <-- DIPERBAIKI: mapping dari camelCase ke snake_case DB
      school_name: data.schoolName || null, // <-- DIPERBAIKI: mapping dari camelCase ke snake_case DB
      role: 'student',
      status: 'active',
      invited_by: invite.created_by
    })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      return { success: false, message: 'Gagal membuat profil. Silakan hubungi admin.', error: profileError }
    }

    // 4. Tandai token sebagai sudah digunakan
    await supabase
      .from('invitations')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id)

    return { success: true, message: 'Registrasi berhasil! Silakan login.' }

  } catch (err) {
    console.error('Register service error:', err)
    return { 
      success: false, 
      message: 'Terjadi kesalahan sistem. Silakan coba lagi.', 
      error: err instanceof Error ? err : new Error('Unknown error') 
    }
  }
}