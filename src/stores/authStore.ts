import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { getProfileByUserId } from '@/services/profileService'
import type { Profile } from '@/types/profile.types'

let isInitialized = false

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isProfileLoading: boolean
  
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isProfileLoading: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    if (isInitialized) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ 
        session, 
        user: session?.user ?? null, 
        isLoading: false 
      })

      // <-- BARU: Jika ada session, fetch profile
      if (session?.user) {
        set({ isProfileLoading: true })
        const profile = await getProfileByUserId(session.user.id)
        set({ profile, isProfileLoading: false })
      }

      supabase.auth.onAuthStateChange(async (event, newSession) => {
        set({ 
          session: newSession, 
          user: newSession?.user ?? null, 
          isLoading: false 
        })

        // <-- BARU: Handle fetch profile berdasarkan event
        if (event === 'SIGNED_IN' && newSession?.user) {
          set({ isProfileLoading: true })
          const profile = await getProfileByUserId(newSession.user.id)
          set({ profile, isProfileLoading: false })
        } else if (event === 'SIGNED_OUT') {
          set({ profile: null })
        }
      })

      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ isLoading: false, isProfileLoading: false })
    }
  },
}))