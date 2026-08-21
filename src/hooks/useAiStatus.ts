/** AI 를 쓸 수 있는지 한 번만 물어보고 앱 전체가 나눠 쓴다.
 *
 *  서버에 키가 없으면 AI 버튼 자체를 띄우지 않는다. 눌러 봐야 503 만 받는
 *  버튼을 보여주는 것보다 없는 편이 낫다.
 */

import { useEffect, useState } from 'react'
import { getAiStatus } from '../api/ai'
import { useAuth } from '../context/AuthContext'

let probe: Promise<boolean> | null = null

export function useAiStatus(): boolean {
  const { status } = useAuth()
  const online = status === 'authenticated'
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!online) {
      // 오프라인에서는 AI 를 쓸 수 없다. 기존 규칙 기반 화면이 그대로 돈다.
      setEnabled(false)
      return
    }

    probe ??= getAiStatus()
      .then((res) => res.enabled)
      .catch(() => false)

    let alive = true
    void probe.then((value) => {
      if (alive) setEnabled(value)
    })
    return () => {
      alive = false
    }
  }, [online])

  return enabled
}
