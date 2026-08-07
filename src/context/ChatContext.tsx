import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Listing } from '../data/listings'

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
}

export interface Conversation {
  id: string
  listingId: string
  listingName: string
  listingSeed: string
  sellerName: string
  messages: ChatMessage[]
}

interface ChatContextValue {
  conversations: Conversation[]
  startOrOpenChat: (listing: Listing) => string
  sendMessage: (conversationId: string, text: string) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

const AUTO_REPLIES = [
  '네 안녕하세요! 아직 판매 중이에요 :)',
  '직거래도 가능하고 택배거래도 가능해요.',
  '네 가격 제안 남겨주시면 확인해볼게요!',
  '오늘 저녁에 답변드릴게요, 조금만 기다려주세요.',
]

function timeNow() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function seedConversations(): Conversation[] {
  return [
    {
      id: 'c-l2',
      listingId: '2',
      listingName: '남성 오버데님셔츠(반팔)',
      listingSeed: 'market-2',
      sellerName: '다니에루',
      messages: [
        { id: 'm1', from: 'them', text: '안녕하세요! 문의 주셔서 감사해요 😊', time: '어제' },
        { id: 'm2', from: 'me', text: '혹시 직거래 가능할까요?', time: '어제' },
        { id: 'm3', from: 'them', text: '네 가능합니다! 주말에 홍대 쪽에서 뵐 수 있어요.', time: '어제' },
      ],
    },
    {
      id: 'c-l4',
      listingId: '4',
      listingName: '듀러블 롱 벌룬 팬츠 (크림)',
      listingSeed: 'market-4',
      sellerName: '가람클레어',
      messages: [
        { id: 'm1', from: 'them', text: '안녕하세요, 편하게 물어보세요!', time: '2일 전' },
      ],
    },
  ]
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)

  const startOrOpenChat = (listing: Listing) => {
    const existing = conversations.find((c) => c.listingId === listing.id)
    if (existing) return existing.id

    const id = `c-${listing.id}-${Date.now()}`
    const conversation: Conversation = {
      id,
      listingId: listing.id,
      listingName: listing.name,
      listingSeed: listing.seed,
      sellerName: listing.seller,
      messages: [
        {
          id: `m-${Date.now()}`,
          from: 'them',
          text: '안녕하세요! 궁금하신 점 있으면 편하게 물어보세요 :)',
          time: timeNow(),
        },
      ],
    }
    setConversations((prev) => [conversation, ...prev])
    return id
  }

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return
    const myMessage: ChatMessage = { id: `m-${Date.now()}`, from: 'me', text, time: timeNow() }
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, myMessage] } : c)),
    )

    setTimeout(() => {
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
      const theirMessage: ChatMessage = {
        id: `m-${Date.now()}-r`,
        from: 'them',
        text: reply,
        time: timeNow(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, theirMessage] } : c,
        ),
      )
    }, 1200)
  }

  return (
    <ChatContext.Provider value={{ conversations, startOrOpenChat, sendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
