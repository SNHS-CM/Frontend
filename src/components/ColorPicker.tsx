import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/* ---------- color math ---------- */
function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  return { h, s, v: max }
}

function toHex(n: number) {
  return n.toString(16).padStart(2, '0')
}
function rgbToHex(r: number, g: number, b: number) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return { r: 86, g: 109, b: 56 }
  const int = parseInt(m[1], 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

/* ---------- component ---------- */
export default function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (hex: string) => void
}) {
  // HSV is the source of truth while interacting, seeded from the initial value.
  const [hsv, setHsv] = useState(() => {
    const { r, g, b } = hexToRgb(value)
    return rgbToHsv(r, g, b)
  })
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'sv' | 'hue' | null>(null)

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
  const pure = hsvToRgb(hsv.h, 1, 1)
  const hueColor = rgbToHex(pure.r, pure.g, pure.b)

  const commit = (next: { h: number; s: number; v: number }) => {
    setHsv(next)
    const c = hsvToRgb(next.h, next.s, next.v)
    onChange(rgbToHex(c.r, c.g, c.b))
  }

  const updateSV = (e: ReactPointerEvent) => {
    const el = svRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    commit({
      ...hsv,
      s: clamp01((e.clientX - r.left) / r.width),
      v: clamp01(1 - (e.clientY - r.top) / r.height),
    })
  }
  const updateHue = (e: ReactPointerEvent) => {
    const el = hueRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    commit({ ...hsv, h: clamp01(1 - (e.clientY - r.top) / r.height) * 360 })
  }

  const setChannel = (ch: 'r' | 'g' | 'b', raw: string) => {
    const n = Math.min(255, Math.max(0, Number(raw) || 0))
    const next = { ...rgb, [ch]: n }
    commit(rgbToHsv(next.r, next.g, next.b))
  }

  return (
    <div>
      <div className="flex gap-3">
        {/* Saturation / value square */}
        <div
          ref={svRef}
          onPointerDown={(e) => {
            dragging.current = 'sv'
            e.currentTarget.setPointerCapture(e.pointerId)
            updateSV(e)
          }}
          onPointerMove={(e) => dragging.current === 'sv' && updateSV(e)}
          onPointerUp={() => (dragging.current = null)}
          className="relative h-44 flex-1 touch-none rounded-2xl"
          style={{
            backgroundColor: hueColor,
            backgroundImage:
              'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
          }}
        >
          <span
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#fff] shadow"
            style={{
              left: `${hsv.s * 100}%`,
              top: `${(1 - hsv.v) * 100}%`,
              backgroundColor: hex,
            }}
          />
        </div>

        {/* Hue slider (bottom = red) */}
        <div
          ref={hueRef}
          onPointerDown={(e) => {
            dragging.current = 'hue'
            e.currentTarget.setPointerCapture(e.pointerId)
            updateHue(e)
          }}
          onPointerMove={(e) => dragging.current === 'hue' && updateHue(e)}
          onPointerUp={() => (dragging.current = null)}
          className="relative h-44 w-6 shrink-0 touch-none rounded-full"
          style={{
            backgroundImage:
              'linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
          }}
        >
          <span
            className="pointer-events-none absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#fff] shadow"
            style={{ top: `${(1 - hsv.h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Preview + RGB inputs */}
      <div className="mt-4 flex items-center gap-3">
        <span
          className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-black/10"
          style={{ backgroundColor: hex }}
        />
        <span className="font-mono text-xs uppercase text-moss-500">{hex}</span>
        <div className="ml-auto flex gap-2">
          {(['r', 'g', 'b'] as const).map((ch) => (
            <label key={ch} className="flex flex-col items-center">
              <span className="mb-0.5 text-[10px] font-semibold uppercase text-moss-400">{ch}</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => setChannel(ch, e.target.value)}
                className="w-12 rounded-lg border border-moss-100 bg-white px-1.5 py-1 text-center text-xs text-ink-900 outline-none focus:border-moss-400"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
