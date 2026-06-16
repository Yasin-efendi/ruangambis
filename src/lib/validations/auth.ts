import { z } from 'zod'

// 1. Definisikan schema validasi untuk form login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  
  password: z
    .string()
    .min(6, { message: 'Password minimal 6 karakter' }),
})

// 2. Ekstrak tipe data TypeScript dari schema Zod
// Hasilnya sama dengan: { email: string, password: string }
export type LoginInput = z.infer<typeof loginSchema>