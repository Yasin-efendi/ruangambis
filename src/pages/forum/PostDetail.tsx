import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import {
  getPostWithComments,
  createComment,
  toggleResolved,
  deletePost,
  deleteComment,
} from '@/services/forumService'
import { useAuthStore } from '@/stores/authStore'
import type { PostWithUser, CommentWithUser } from '@/types/forum.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
// SUB-COMPONENT: CommentCard
// ============================================================
function CommentCard({
  comment,
  currentUserId,
  currentUserRole,
  onDelete,
}: {
  comment: CommentWithUser
  currentUserId: string
  currentUserRole: 'admin' | 'student'
  onDelete: (commentId: string) => void
}) {
  const isOwner = comment.user_id === currentUserId
  const isAdmin = currentUserRole === 'admin'
  const canDelete = isOwner || isAdmin

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
      {/* Avatar */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500/20 text-blue-300 font-semibold text-sm flex-shrink-0">
        {comment.user.username.charAt(0).toUpperCase()}
      </div>

      {/* Konten */}
      <div className="flex-1 min-w-0">
        {/* Header: Author + Time */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-white text-sm">
            @{comment.user.username}
          </span>
          {comment.user.role === 'admin' && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
              👑 Admin
            </span>
          )}
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-xs text-zinc-500">
            {formatRelativeTime(comment.created_at)}
          </span>
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Isi komentar */}
        <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT: PostDetailPage
// ============================================================
export default function PostDetailPage() {
  const { postId } = useParams({ strict: false }) as { postId: string }
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const [post, setPost] = useState<PostWithUser | null>(null)
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form komentar
  const [commentContent, setCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // State untuk toggle resolved
  const [isTogglingResolved, setIsTogglingResolved] = useState(false)

  // State untuk delete confirmation
  const [showDeletePostModal, setShowDeletePostModal] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getPostWithComments(postId)
        if (!data) {
          setError('Post tidak ditemukan.')
          setIsLoading(false)
          return
        }

        setPost(data.post)
        setComments(data.comments)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Gagal memuat post. Silakan coba lagi.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId])

  // Handler: Submit komentar
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !post) return

    setIsSubmittingComment(true)

    const comment = await createComment({
      post_id: post.id,
      content: commentContent.trim(),
    })

    if (comment) {
      // Optimistic update: tambah komentar baru ke list
      const newComment: CommentWithUser = {
        ...comment,
        user: {
          username: profile?.username || 'Unknown',
          role: profile?.role || 'student',
        },
      }
      setComments((prev) => [...prev, newComment])
      setCommentContent('')

      // Update comments_count di post
      setPost((prev) => (prev ? { ...prev, comments_count: prev.comments_count + 1 } : null))
    } else {
      setError('Gagal mengirim komentar. Silakan coba lagi.')
    }

    setIsSubmittingComment(false)
  }

  // Handler: Toggle resolved
  const handleToggleResolved = async () => {
    if (!post) return

    setIsTogglingResolved(true)
    const success = await toggleResolved(post.id, !post.is_resolved)

    if (success) {
      setPost((prev) => (prev ? { ...prev, is_resolved: !prev.is_resolved } : null))
    } else {
      setError('Gagal mengubah status. Silakan coba lagi.')
    }

    setIsTogglingResolved(false)
  }

  // Handler: Delete post
  const handleDeletePost = async () => {
    if (!post) return

    setIsDeletingPost(true)
    const success = await deletePost(post.id)

    if (success) {
      navigate({ to: '/forum' })
    } else {
      setError('Gagal menghapus post. Silakan coba lagi.')
      setIsDeletingPost(false)
      setShowDeletePostModal(false)
    }
  }

  // Handler: Delete comment
  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId)

    if (success) {
      // Optimistic update: hapus komentar dari list
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setPost((prev) =>
        prev ? { ...prev, comments_count: Math.max(0, prev.comments_count - 1) } : null
      )
    } else {
      setError('Gagal menghapus komentar. Silakan coba lagi.')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat post...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50 p-4">
        <Card className="w-full max-w-md border-red-800 bg-red-950/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-300">{error}</p>
              <Link to="/forum">
                <Button className="bg-red-600 hover:bg-red-500 text-white">
                  Kembali ke Forum
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!post) return null

  // Check ownership
  const currentUserId = user?.id || ''
  const currentUserRole = profile?.role || 'student'
  const isOwner = post.user_id === currentUserId
  const isAdmin = currentUserRole === 'admin'
  const canManagePost = isOwner || isAdmin

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            to="/forum"
            className="text-sm text-zinc-400 hover:text-white transition-colors mb-2 inline-block"
          >
            ← Kembali ke Forum
          </Link>
        </div>

        {/* Pesan Error (jika ada) */}
        {error && (
          <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-300">
            ❌ {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Post Card */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {post.is_resolved && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                      ✓ Terjawab
                    </span>
                  )}
                </div>
                <CardTitle className="text-white text-2xl">{post.title}</CardTitle>
              </div>
              {canManagePost && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={handleToggleResolved}
                    variant="outline"
                    size="sm"
                    className={
                      post.is_resolved
                        ? 'border-green-700 bg-green-950/30 text-green-300 hover:bg-green-950/50'
                        : 'border-yellow-700 bg-yellow-950/30 text-yellow-300 hover:bg-yellow-950/50'
                    }
                    disabled={isTogglingResolved}
                  >
                    {isTogglingResolved ? '...' : post.is_resolved ? '✓ Terjawab' : 'Tandai Terjawab'}
                  </Button>
                  <Button
                    onClick={() => setShowDeletePostModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-red-700 bg-red-950/30 text-red-300 hover:bg-red-950/50"
                  >
                    Hapus
                  </Button>
                </div>
              )}
            </div>
            <CardDescription className="text-zinc-400">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 font-semibold text-xs">
                    {post.user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-zinc-300">@{post.user.username}</span>
                  {post.user.role === 'admin' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      👑 Admin
                    </span>
                  )}
                </div>
                <span>•</span>
                <span>{formatRelativeTime(post.created_at)}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </CardContent>
        </Card>

        {/* Komentar Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Komentar ({post.comments_count})
          </h2>

          {/* List Komentar */}
          {comments.length === 0 ? (
            <Card className="border-zinc-800 bg-zinc-900">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-2">
                  <div className="text-4xl">💬</div>
                  <p className="text-zinc-400">
                    Belum ada komentar. Jadilah yang pertama untuk menjawab!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Form Tambah Komentar */}
          <Card className="border-zinc-800 bg-zinc-900">
            <CardContent className="pt-5">
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Tulis komentar atau jawabanmu..."
                  rows={4}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  disabled={isSubmittingComment}
                  maxLength={2000}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500">
                    {commentContent.length}/2000
                  </span>
                  <Button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                    disabled={isSubmittingComment || !commentContent.trim()}
                  >
                    {isSubmittingComment ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        Mengirim...
                      </span>
                    ) : (
                      'Kirim Komentar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Post */}
      {showDeletePostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-700 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-red-300 text-xl">Hapus Post?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">
                Apakah kamu yakin ingin menghapus post ini? Tindakan ini{' '}
                <strong>tidak dapat dibatalkan</strong> dan semua komentar akan ikut terhapus.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowDeletePostModal(false)}
                  variant="outline"
                  className="flex-1 border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  disabled={isDeletingPost}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeletePost}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                  disabled={isDeletingPost}
                >
                  {isDeletingPost ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Menghapus...
                    </span>
                  ) : (
                    'Ya, Hapus'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}