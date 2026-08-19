import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Listing } from '../data/listings'
import type { OutfitPost } from '../data/posts'

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
}

/** A conversation always hangs off something — a market listing or a discover post. */
export type SubjectKind = 'listing' | 'post'

export interface Conversation {
  id: string
  subjectKind: SubjectKind
  subjectId: string
  subjectTitle: string
  subjectSeed: string
  partnerName: string
  messages: ChatMessage[]
}

interface ChatContextValue {
  conversations: Conversation[]
  startOrOpenChat: (listing: Listing) => string
  startOrOpenPostChat: (post: OutfitPost) => string
  sendMessage: (conversationId: string, text: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

const LISTING_REPLIES = [
  '네 안녕하세요! 아직 판매 중이에요 :)',
  '직거래도 가능하고 택배거래도 가능해요.',
  '네 가격 제안 남겨주시면 확인해볼게요!',
  '오늘 저녁에 답변드릴게요, 조금만 기다려주세요.',
]

const POST_REPLIES = [
  '안녕하세요! 코디 봐주셔서 감사해요 😊',
  '그 상의는 한 사이즈 크게 입었어요!',
  '저는 163에 S 입는데, 참고되셨으면 좋겠어요.',
  '해당 아이템은 마켓에도 올려뒀어요!',
]

export function subjectHref(c: Conversation) {
  return c.subjectKind === 'listing' ? `/market/${c.subjectId}` : `/discover/${c.subjectId}`
}

function timeNow() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function seedConversations(): Conversation[] {
  return [
    {
      id: 'c-l2',
      subjectKind: 'listing',
      subjectId: '2',
      subjectTitle: '남성 오버데님셔츠(반팔)',
      subjectSeed: 'market-2',
      partnerName: '다니에루',
      messages: [
        { id: 'm1', from: 'them', text: '안녕하세요! 문의 주셔서 감사해요 😊', time: '어제' },
        { id: 'm2', from: 'me', text: '혹시 직거래 가능할까요?', time: '어제' },
        { id: 'm3', from: 'them', text: '네 가능합니다! 주말에 홍대 쪽에서 뵐 수 있어요.', time: '어제' },
      ],
    },
    {
      id: 'c-l4',
      subjectKind: 'listing',
      subjectId: '4',
      subjectTitle: '듀러블 롱 벌룬 팬츠 (크림)',
      subjectSeed: 'market-4',
      partnerName: '가람클레어',
      messages: [
        { id: 'm1', from: 'them', text: '안녕하세요, 편하게 물어보세요!', time: '2일 전' },
      ],
    },
  ]
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)

  const startOrOpen = (
    kind: SubjectKind,
    subjectId: string,
    subjectTitle: string,
    subjectSeed: string,
    partnerName: string,
    greeting: string,
  ) => {
    const existing = conversations.find(
      (c) => c.subjectKind === kind && c.subjectId === subjectId,
    )
    if (existing) return existing.id

    const id = `c-${kind}-${subjectId}-${Date.now()}`
    const conversation: Conversation = {
      id,
      subjectKind: kind,
      subjectId,
      subjectTitle,
      subjectSeed,
      partnerName,
      messages: [{ id: `m-${Date.now()}`, from: 'them', text: greeting, time: timeNow() }],
    }
    setConversations((prev) => [conversation, ...prev])
    return id
  }

  const startOrOpenChat = (listing: Listing) =>
    startOrOpen(
      'listing',
      listing.id,
      listing.name,
      listing.seed,
      listing.seller,
      '안녕하세요! 궁금하신 점 있으면 편하게 물어보세요 :)',
    )

  const startOrOpenPostChat = (post: OutfitPost) =>
    startOrOpen(
      'post',
      post.id,
      post.title,
      post.seed,
      post.author.name,
      '안녕하세요! 코디에 대해 궁금한 점 있으면 물어보세요 :)',
    )

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return
    const myMessage: ChatMessage = { id: `m-${Date.now()}`, from: 'me', text, time: timeNow() }
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, myMessage] } : c)),
    )

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          const pool = c.subjectKind === 'post' ? POST_REPLIES : LISTING_REPLIES
          const theirMessage: ChatMessage = {
            id: `m-${Date.now()}-r`,
            from: 'them',
            text: pool[Math.floor(Math.random() * pool.length)],
            time: timeNow(),
          }
          return { ...c, messages: [...c.messages, theirMessage] }
        }),
      )
    }, 1200)
  }

  return (
    <ChatContext.Provider
      value={{ conversations, startOrOpenChat, startOrOpenPostChat, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
