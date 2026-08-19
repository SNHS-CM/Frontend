import { createContext, useContext, useState, type ReactNode } from 'react'
import { posts as seedPosts, type OutfitPost } from '../data/posts'

interface PostsContextValue {
  posts: OutfitPost[]
  getPost: (id: string) => OutfitPost | undefined
  isLiked: (id: string) => boolean
  toggleLike: (id: string) => void
  likeCount: (post: OutfitPost) => number
  isSaved: (id: string) => boolean
  toggleSave: (id: string) => void
  saveCount: (post: OutfitPost) => number
  likedPosts: OutfitPost[]
  savedPosts: OutfitPost[]
}

const PostsContext = createContext<PostsContextValue | null>(null)

function toggle(set: Set<string>, id: string) {
  const next = new Set(set)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts] = useState<OutfitPost[]>(seedPosts)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const getPost = (id: string) => posts.find((p) => p.id === id)

  const isLiked = (id: string) => liked.has(id)
  const toggleLike = (id: string) => setLiked((prev) => toggle(prev, id))
  // Seed counts are static, so reflect the viewer's own like on top of them.
  const likeCount = (post: OutfitPost) => post.likes + (liked.has(post.id) ? 1 : 0)

  const isSaved = (id: string) => saved.has(id)
  const toggleSave = (id: string) => setSaved((prev) => toggle(prev, id))
  const saveCount = (post: OutfitPost) => post.saves + (saved.has(post.id) ? 1 : 0)

  const likedPosts = posts.filter((p) => liked.has(p.id))
  const savedPosts = posts.filter((p) => saved.has(p.id))

  return (
    <PostsContext.Provider
      value={{
        posts,
        getPost,
        isLiked,
        toggleLike,
        likeCount,
        isSaved,
        toggleSave,
        saveCount,
        likedPosts,
        savedPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const ctx = useContext(PostsContext)
  if (!ctx) throw new Error('usePosts must be used within PostsProvider')
  return ctx
}
