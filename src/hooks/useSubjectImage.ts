import type { Conversation } from '../context/ChatContext'
import { useListings } from '../context/ListingsContext'
import { usePosts } from '../context/PostsContext'
import { resolveListingImage } from '../data/listings'
import { resolvePostImage } from '../data/posts'
import { productImage } from '../data/products'

/** Resolves a conversation's thumbnail, whichever kind of subject it hangs off. */
export function useSubjectImage() {
  const { getListing } = useListings()
  const { getPost } = usePosts()

  return (c: Conversation, w = 120, h = 120) => {
    if (c.subjectKind === 'listing') {
      const listing = getListing(c.subjectId)
      return listing ? resolveListingImage(listing, w, h) : productImage(c.subjectSeed, w, h)
    }
    if (c.subjectKind === 'post') {
      const post = getPost(c.subjectId)
      return post ? resolvePostImage(post, w, h) : productImage(c.subjectSeed, w, h)
    }
    return productImage(c.subjectSeed, w, h)
  }
}
