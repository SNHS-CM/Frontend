import { ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import ColorPicker from '../../components/ColorPicker'
import Sheet from '../../components/Sheet'
import { useProfile } from '../../context/ProfileContext'
import { useI18n } from '../../i18n'

export default function BannerEditor({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { profile, updateProfile } = useProfile()
  const [color, setColor] = useState(profile.bannerColor)
  const [image, setImage] = useState(profile.bannerImage)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const save = () => {
    updateProfile({ bannerColor: color, bannerImage: image })
    onClose()
  }

  const footer = (
    <button
      type="button"
      onClick={save}
      className="w-full rounded-full bg-moss-700 py-3.5 text-sm font-semibold text-cream active:bg-moss-800"
    >
      {t('common.save')}
    </button>
  )

  return (
    <Sheet title={t('banner.title')} onClose={onClose} footer={footer}>
      <div className="px-5 pt-2">
        {/* Live preview */}
        <div
          className="h-28 w-full overflow-hidden rounded-2xl bg-cover bg-center ring-1 ring-black/5"
          style={
            image
              ? { backgroundImage: `url(${image})` }
              : { backgroundColor: color }
          }
        />
        <p className="mt-3 text-xs text-moss-500">{t('banner.note')}</p>
      </div>

      {/* Color picker */}
      <div className="px-5 pt-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-moss-400">
          {t('banner.color')}
        </h2>
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <ColorPicker
            value={color}
            onChange={(hex) => {
              setColor(hex)
              setImage('') // choosing a color clears the photo
            }}
          />
        </div>
      </div>

      {/* Photo */}
      <div className="px-5 pt-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-moss-300 py-3.5 text-sm font-medium text-moss-600"
        >
          <ImagePlus size={18} />
          {t('banner.photo')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={pickPhoto}
          className="hidden"
        />
      </div>
    </Sheet>
  )
}
