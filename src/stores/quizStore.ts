import { create } from 'zustand'

// 1. Definisikan tipe data untuk state dan actions
interface QuizState {
  currentIndex: number
  setIndex: (index: number) => void
  reset: () => void
}

// 2. Buat store dengan sintaks Zustand v5 (double invocation)
export const useQuizStore = create<QuizState>()((set) => ({
  currentIndex: 0,
  
  // Action untuk mengubah index
  setIndex: (index) => set({ currentIndex: index }),
  
  // Action untuk mereset ke awal
  reset: () => set({ currentIndex: 0 }),
}))