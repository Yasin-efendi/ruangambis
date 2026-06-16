import { z } from 'zod'

/**
 * Schema validasi untuk form update profil
 * 
 * Aturan:
 * - username: wajib, 3-30 karakter, hanya huruf/angka/underscore
 * - full_name: optional, tapi jika diisi minimal 2 karakter, maks 100
 * - school_name: optional, maks 100 karakter
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(30, { message: 'Username maksimal 30 karakter' })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: 'Username hanya boleh huruf, angka, dan underscore' 
    }),
  
  full_name: z
    .string()
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' })
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 2, {
      message: 'Nama lengkap minimal 2 karakter jika diisi',
    }),
  
  school_name: z
    .string()
    .max(100, { message: 'Nama sekolah maksimal 100 karakter' })
    .optional()
    .or(z.literal('')),
})

/**
 * Ekstrak tipe data TypeScript dari schema Zod
 * Hasilnya sama dengan ProfileUpdateInput di profile.types.ts
 */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>