import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '../services/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean

  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  // Tipe data untuk fungsi initialize yang akan menginisialisasi status autentikasi pengguna saat aplikasi dimuat
  initialize: () => Promise<void>
	// Mendengarkan perubahan status auth (login/logout) secara real-time dan mengembalikan fungsi cleanup untuk unsubscribe
	subscribeToAuthChanges: () => () => void
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    session: null,
    isLoading: true,

    setUser: (user) => set({ user }),

    setSession: (session) =>
      set({ session }),

    setLoading: (loading) =>
      set({ isLoading: loading }),

    // Membaca session yang tersimpan di local storage Supabase
    // saat aplikasi dimuat dan mengupdate state dengan informasi session dan user yang sesuai
    initialize: async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        set({
          session,
          user: session?.user ?? null,
          isLoading: false,
        })
      } catch (error) {
        console.error(error)

        set({
          session: null,
          user: null,
          isLoading: false,
        })
      }
    },

		/**
		 * Mendengarkan perubahan status autentikasi secara real-time (login/logout/token refresh).
		 * Fungsi ini mengembalikan fungsi pembersih (cleanup) untuk mencegah kebocoran memori.
		 */
		subscribeToAuthChanges: () => {
			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange(
				(_event, session) => {
					set({
						session,
						user: session?.user ?? null,
						isLoading: false,
					})
				},
			)

			return () => {
				subscription.unsubscribe()
			}
		},
  }),
)