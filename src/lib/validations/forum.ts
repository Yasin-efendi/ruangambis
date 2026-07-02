import { z } from 'zod'

/**
 * Schema validasi untuk form create post
 * 
 * Aturan:
 * - title: wajib, 5-200 karakter
 * - content: wajib, 20-5000 karakter
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Judul minimal 5 karakter' })
    .max(200, { message: 'Judul maksimal 200 karakter' }),
  
  content: z
    .string()
    .min(20, { message: 'Konten minimal 20 karakter agar lebih jelas' })
    .max(5000, { message: 'Konten maksimal 5000 karakter' }),
})

/**
 * Ekstrak tipe data TypeScript dari schema Zod
 */
export type CreatePostInput = z.infer<typeof createPostSchema>