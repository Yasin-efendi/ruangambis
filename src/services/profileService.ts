import { supabase } from '@/services/supabase'
import type { Profile, ProfileUpdateInput } from '@/types/profile.types'

/**
 * Ambil data profil berdasarkan user ID
 * 
 * @param userId - ID user dari auth.users (sama dengan profiles.id)
 * @returns Profile jika ditemukan, null jika tidak ada
 */
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116 = "No rows found" di Supabase
      if (error.code === 'PGRST116') {
        console.warn(`Profile not found for user ${userId}`)
        return null
      }
      
      console.error('Error fetching profile:', error)
      throw error
    }

    return data as Profile
  } catch (err) {
    console.error('getProfileByUserId error:', err)
    return null
  }
}

/**
 * Update data profil user
 * 
 * @param userId - ID user yang profilnya akan diupdate
 * @param updates - Data yang akan diupdate (hanya field yang boleh diedit)
 * @returns Profile yang sudah diupdate, atau null jika gagal
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdateInput
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    return data as Profile
  } catch (err) {
    console.error('updateProfile error:', err)
    return null
  }
}