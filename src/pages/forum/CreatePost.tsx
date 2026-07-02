import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { createPost } from '@/services/forumService'
import { createPostSchema } from '@/lib/validations/forum'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * CreatePostPage — Form untuk membuat post diskusi baru
 * 
 * Fitur:
 * - Form judul + konten
 * - Validasi Zod client-side
 * - Auto-redirect ke detail post setelah submit
 * - Error handling
 * - Tombol batal untuk kembali ke forum
 */
export default function CreatePostPage() {
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handler: Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // 1. Validasi dengan Zod
    const result = createPostSchema.safeParse({ title, content })
    
    if (!result.success) {
      setError(result.error.errors[0].message)
      setIsLoading(false)
      return
    }

    // 2. Panggil service untuk insert ke database
    const post = await createPost(result.data)

    if (!post) {
      setError('Gagal membuat post. Silakan coba lagi.')
      setIsLoading(false)
      return
    }

    // 3. Redirect ke detail post yang baru dibuat
    navigate({
      to: '/forum/$postId',
      params: { postId: post.id },
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/forum"
            className="text-sm text-zinc-400 hover:text-white transition-colors mb-2 inline-block"
          >
            ← Kembali ke Forum
          </Link>
          <h1 className="text-3xl font-bold text-white">Buat Post Baru</h1>
          <p className="text-zinc-400 mt-1">
            Ajukan pertanyaan atau mulai diskusi dengan sesama siswa
          </p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-2">
            ❌ {error}
          </div>
        )}

        {/* Card Form */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white text-xl">Informasi Post</CardTitle>
            <CardDescription className="text-zinc-400">
              Tulis pertanyaan atau topik diskusimu dengan jelas
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Judul */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-zinc-300">
                  Judul Post <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Bagaimana cara menyelesaikan soal logika silogisme?"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={isLoading}
                  maxLength={200}
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Buat judul yang singkat tapi jelas</span>
                  <span>{title.length}/200</span>
                </div>
              </div>

              {/* Textarea Konten */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-zinc-300">
                  Detail Pertanyaan <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau topik diskusimu secara detail. Semakin jelas, semakin mudah teman-teman membantu..."
                  rows={8}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  disabled={isLoading}
                  maxLength={5000}
                />
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Sertakan konteks, apa yang sudah kamu coba, atau di mana kamu bingung</span>
                  <span>{content.length}/5000</span>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-md bg-blue-950/30 border border-blue-800/50 p-3 text-xs text-blue-200/80 space-y-1">
                <p className="font-semibold text-blue-300">💡 Tips Membuat Post yang Baik:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Gunakan judul yang spesifik (hindari: "Tolong bantu", "Soal susah")</li>
                  <li>Jelaskan konteks pertanyaan dengan detail</li>
                  <li>Tuliskan apa yang sudah kamu coba atau pikirkan</li>
                  <li>Bersikap sopan dan hargai orang yang membantu</li>
                </ul>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/forum" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Memublikasikan...
                    </span>
                  ) : (
                    'Publikasikan Post →'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}