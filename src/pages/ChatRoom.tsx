import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { useListings } from '../context/ListingsContext'
import { resolveListingImage } from '../data/listings'
import { productImage } from '../data/products'

export default function ChatRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { conversations, sendMessage } = useChat()
  const { getListing } = useListings()
  const [draft, setDraft] = useState('')

  const conversation = conversations.find((c) => c.id === id)
  if (!conversation) return <Navigate to="/chat" replace />

  const handleSend = () => {
    if (!draft.trim()) return
    sendMessage(conversation.id, draft)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-moss-100 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="flex-1 truncate text-sm font-medium text-ink-900">{conversation.sellerName}</p>
      </header>

      <Link
        to={`/market/${conversation.listingId}`}
        className="flex items-center gap-3 border-b border-moss-100 bg-moss-50 px-4 py-2.5"
      >
        <img
          src={
            getListing(conversation.listingId)
              ? resolveListingImage(getListing(conversation.listingId)!, 100, 100)
              : productImage(conversation.listingSeed, 100, 100)
          }
          alt={conversation.listingName}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <p className="truncate text-xs font-medium text-moss-600">{conversation.listingName}</p>
      </Link>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {conversation.messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[75%] items-end gap-1.5 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                  m.from === 'me'
                    ? 'rounded-br-sm bg-moss-700 text-sand-50'
                    : 'rounded-bl-sm bg-moss-100 text-ink-900'
                }`}
              >
                {m.text}
              </div>
              <span className="shrink-0 text-[10px] text-moss-400">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-moss-100 bg-sand-50 px-4 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full bg-moss-100 px-4 py-2.5 text-sm text-ink-900 placeholder:text-moss-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          aria-label="전송"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-500 text-sand-50 active:bg-clay-600"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
