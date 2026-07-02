import { supabase } from '@/services/supabase'
import type {
  Post,
  Comment,
  PostWithUser,
  CommentWithUser,
  CreatePostInput,
  CreateCommentInput,
} from '@/types/forum.types'

/**
 * Ambil semua posts dengan info user (username & role)
 * Diurutkan dari terbaru, limit 50 posts
 * 
 * @returns Array of PostWithUser (bisa kosong)
 */
export async function getPosts(): Promise<PostWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        title,
        content,
        package_id,
        subtest_id,
        question_id,
        is_resolved,
        comments_count,
        created_at,
        updated_at,
        user:profiles!posts_user_id_fkey (
          username,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    if (!data) return []

    // Transform ke PostWithUser
    return data.map((post: any) => ({
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      package_id: post.package_id,
      subtest_id: post.subtest_id,
      question_id: post.question_id,
      is_resolved: post.is_resolved,
      comments_count: post.comments_count,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: post.user || { username: 'Unknown', role: 'student' },
    }))
  } catch (err) {
    console.error('getPosts error:', err)
    return []
  }
}

/**
 * Ambil detail post + semua komentar dengan info user
 * 
 * @param postId - ID post yang ingin diambil
 * @returns Object { post, comments } atau null jika post tidak ditemukan
 */
export async function getPostWithComments(
  postId: string
): Promise<{ post: PostWithUser; comments: CommentWithUser[] } | null> {
  try {
    // 1. Query post dengan info user
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        title,
        content,
        package_id,
        subtest_id,
        question_id,
        is_resolved,
        comments_count,
        created_at,
        updated_at,
        user:profiles!posts_user_id_fkey (
          username,
          role
        )
      `)
      .eq('id', postId)
      .single()

    if (postError || !postData) {
      console.error('Error fetching post:', postError)
      return null
    }

    const post: PostWithUser = {
      id: postData.id,
      user_id: postData.user_id,
      title: postData.title,
      content: postData.content,
      package_id: postData.package_id,
      subtest_id: postData.subtest_id,
      question_id: postData.question_id,
      is_resolved: postData.is_resolved,
      comments_count: postData.comments_count,
      created_at: postData.created_at,
      updated_at: postData.updated_at,
      user: (postData as any).user || { username: 'Unknown', role: 'student' },
    }

    // 2. Query semua komentar dengan info user
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at,
        user:profiles!comments_user_id_fkey (
          username,
          role
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return { post, comments: [] }
    }

    const comments: CommentWithUser[] = (commentsData || []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user: c.user || { username: 'Unknown', role: 'student' },
    }))

    return { post, comments }
  } catch (err) {
    console.error('getPostWithComments error:', err)
    return null
  }
}

/**
 * Buat post baru
 * user_id otomatis diambil dari auth
 * 
 * @param input - Data post (title, content, optional tags)
 * @returns Post yang baru dibuat, atau null jika gagal
 */
export async function createPost(
  input: CreatePostInput
): Promise<Post | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: input.title,
        content: input.content,
        package_id: input.package_id || null,
        subtest_id: input.subtest_id || null,
        question_id: input.question_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return null
    }

    return data as Post
  } catch (err) {
    console.error('createPost error:', err)
    return null
  }
}

/**
 * Buat komentar baru di post tertentu
 * user_id otomatis diambil dari auth
 * 
 * @param input - Data komentar (post_id, content)
 * @returns Comment yang baru dibuat, atau null jika gagal
 */
export async function createComment(
  input: CreateCommentInput
): Promise<Comment | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('User not authenticated')
      return null
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: input.post_id,
        user_id: user.id,
        content: input.content,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return null
    }

    return data as Comment
  } catch (err) {
    console.error('createComment error:', err)
    return null
  }
}

/**
 * Toggle status resolved pada post
 * Hanya owner yang bisa toggle (divalidasi oleh RLS)
 * 
 * @param postId - ID post
 * @param isResolved - Status baru (true/false)
 * @returns true jika berhasil, false jika gagal
 */
export async function toggleResolved(
  postId: string,
  isResolved: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ is_resolved: isResolved })
      .eq('id', postId)

    if (error) {
      console.error('Error toggling resolved:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('toggleResolved error:', err)
    return false
  }
}

/**
 * Hapus post
 * Hanya owner atau admin yang bisa hapus (divalidasi oleh RLS)
 * 
 * @param postId - ID post yang akan dihapus
 * @returns true jika berhasil, false jika gagal
 */
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting post:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('deletePost error:', err)
    return false
  }
}

/**
 * Hapus komentar
 * Hanya owner atau admin yang bisa hapus (divalidasi oleh RLS)
 * 
 * @param commentId - ID komentar yang akan dihapus
 * @returns true jika berhasil, false jika gagal
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('deleteComment error:', err)
    return false
  }
}