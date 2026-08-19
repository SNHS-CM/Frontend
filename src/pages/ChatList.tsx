import { ArrowLeft, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { useSubjectImage } from '../hooks/useSubjectImage'

export default function ChatList() {
  const navigate = useNavigate()
  const { conversations } = useChat()
  const subjectImage = useSubjectImage()

  return (
    <div className="pb-10">
      <header className="flex items-center gap-3 px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-xl font-medium text-ink-900">채팅</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss-100">
            <MessageCircle size={26} className="text-moss-500" />
          </div>
          <p className="text-sm text-moss-500">아직 대화가 없어요</p>
        </div>
      ) : (
        <div className="divide-y divide-moss-100 px-5">
          {conversations.map((c) => {
            const lastMessage = c.messages[c.messages.length - 1]
            return (
              <Link key={c.id} to={`/chat/${c.id}`} className="flex items-center gap-3 py-3.5">
                <img
                  src={subjectImage(c)}
                  alt={c.subjectTitle}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink-900">{c.partnerName}</p>
                    {lastMessage && (
                      <span className="shrink-0 text-[11px] text-moss-400">{lastMessage.time}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.subjectKind === 'post' && (
                      <span className="shrink-0 rounded bg-moss-100 px-1 py-px text-[9px] font-medium text-moss-600">
                        코디
                      </span>
                    )}
                    <p className="truncate text-xs text-moss-500">{c.subjectTitle}</p>
                  </div>
                  {lastMessage && (
                    <p className="truncate text-xs text-moss-400">
                      {lastMessage.from === 'me' ? '나: ' : ''}
                      {lastMessage.text}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
