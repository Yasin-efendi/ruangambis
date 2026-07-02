import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { getPosts } from '@/services/forumService'
import type { PostWithUser } from '@/types/forum.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================
// HELPER: Format relative time (Indonesia)
// ============================================================
function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay < 7) return `${diffDay} hari yang lalu`
  if (diffWeek < 4) return `${diffWeek} minggu yang lalu`
  if (diffMonth < 12) return `${diffMonth} bulan yang lalu`
  return `${diffYear} tahun yang lalu`
}

// ============================================================
// SUB-COMPONENT: PostCard
// ============================================================
function PostCard({ post }: { post: PostWithUser }) {
  return (
    <Link to="/forum/$postId" params={{ postId: post.id }}>
      <Card className="border-zinc-800 bg-zinc-900 hover:border-violet-500/50 transition-all cursor-pointer group">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500/20 text-violet-300 font-semibold flex-shrink-0">
              {post.user.username.charAt(0).toUpperCase()}
            </div>

            {/* Konten */}
            <div className="flex-1 min-w-0">
              {/* Header: Judul + Status */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.is_resolved && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 flex-shrink-0">
                    ✓ Terjawab
                  </span>
                )}
              </div>

              {/* Preview konten */}
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                {post.content}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="font-medium text-zinc-300">
                  @{post.user.username}
                </span>
                <span>•</span>
                <span>{formatRelativeTime(post.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  💬 {post.comments_count} {post.comments_count === 1 ? 'komentar' : 'komentar'}
                </span>
                {post.user.role === 'admin' && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      👑 Admin
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ============================================================
// MAIN COMPONENT: ForumListPage
// ============================================================
export default function ForumListPage() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all')

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getPosts()
        setPosts(data)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError('Gagal memuat forum. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (filter === 'unresolved') return !post.is_resolved
    if (filter === 'resolved') return post.is_resolved
    return true
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat forum...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Forum Diskusi</h1>
            <p className="text-zinc-400 mt-1">
              Tanya, diskusi, dan berbagi dengan sesama siswa
            </p>
          </div>
          <Link to="/forum/create">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold">
              + Buat Post Baru
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        {posts.length > 0 && (
          <div className="flex gap-2 border-b border-zinc-800 pb-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Semua ({posts.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unresolved'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Belum Terjawab ({posts.filter((p) => !p.is_resolved).length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'resolved'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Terjawab ({posts.filter((p) => p.is_resolved).length})
            </button>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4 max-w-md mx-auto">
                <div className="text-6xl">💬</div>
                <h2 className="text-2xl font-bold text-white">
                  Forum Masih Kosong
                </h2>
                <p className="text-zinc-400">
                  Belum ada post diskusi. Jadilah yang pertama untuk memulai
                  percakapan! Tanyakan soal yang membuatmu bingung atau bagikan
                  tips belajarmu.
                </p>
                <Link to="/forum/create">
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white font-semibold mt-2">
                    Buat Post Pertama →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-3">
                <div className="text-4xl">🔍</div>
                <p className="text-zinc-400">
                  Tidak ada post dengan filter ini.
                </p>
                <Button
                  onClick={() => setFilter('all')}
                  variant="outline"
                  className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                >
                  Tampilkan Semua Post
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* List Posts */
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}