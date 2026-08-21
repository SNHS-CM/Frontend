/** 헤더에 붙는 연결 상태 배지.
 *
 *  두 가지 상황을 구분한다. **데모 빌드**는 백엔드를 붙일 생각이 없는 상태라
 *  다시 연결할 것이 없다 — 그래서 누를 수 없는 표시로만 둔다. **오프라인**은
 *  서버에 닿지 못한 것이므로, 눌러서 다시 시도할 수 있게 한다.
 *
 *  같은 마크업이 홈·마켓·디스커버·아웃핏·프로필에 흩어져 있던 것을 한곳으로 모았다.
 */

import { CloudOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../i18n'

const SHELL =
  'flex items-center gap-1.5 rounded-full bg-clay-100 px-3 py-1.5 text-[11px] font-medium text-clay-600'

export default function ConnectionBadge() {
  const { status, demo, refresh } = useAuth()
  const { t } = useI18n()

  if (status !== 'offline') return null

  if (demo) {
    return (
      <span className={SHELL} title={t('demo.note')}>
        <CloudOff size={13} />
        {t('demo.badge')}
      </span>
    )
  }

  return (
    <button type="button" onClick={refresh} title={t('auth.offline.note')} className={SHELL}>
      <CloudOff size={13} />
      {t('auth.offline.badge')}
    </button>
  )
}
