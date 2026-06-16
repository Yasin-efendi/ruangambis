import { z } from 'zod'

// 1. Schema untuk validasi token di URL
export const registerTokenSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Token invite wajib ada di URL' }),
})

// 2. Schema untuk form register
export const registerSchema = z.object({
  token: z
    .string()
    .min(1, { message: 'Token invite tidak valid' }),
  
  email: z
    .string()
    .min(1, { message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  
  password: z
    .string()
    .min(6, { message: 'Password minimal 6 karakter' }),
  
  confirmPassword: z
    .string()
    .min(1, { message: 'Konfirmasi password wajib diisi' }),
  
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(30, { message: 'Username maksimal 30 karakter' })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: 'Username hanya boleh huruf, angka, dan underscore' 
    }),
  
  fullName: z
    .string()
    .min(1, { message: 'Nama lengkap wajib diisi' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' }),
  
  schoolName: z
    .string()
    .max(100, { message: 'Nama sekolah maksimal 100 karakter' })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'], // Error akan muncul di field confirmPassword
})

// 3. Ekstrak tipe data TypeScript dari schema
export type RegisterTokenInput = z.infer<typeof registerTokenSchema>
export type RegisterInput = z.infer<typeof registerSchema>