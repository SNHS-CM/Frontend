import { ArrowLeft, Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useListings, type ListingInput } from '../context/ListingsContext'
import { resolveListingImage, type Listing } from '../data/listings'

const CONDITIONS: Listing['condition'][] = ['새상품', '거의 새것', '사용감 조금 있음', '사용감 있음']

function suggestPoints(discountedPrice: number) {
  if (!discountedPrice) return ''
  return String(Math.max(10, Math.round((50 + discountedPrice / 3000) / 5) * 5))
}

export default function ListingForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { getListing, addListing, updateListing } = useListings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existing = isEdit ? getListing(id!) : undefined
  if (isEdit && !existing) return <Navigate to="/market" replace />

  const [image, setImage] = useState(existing ? resolveListingImage(existing) : '')
  const [brand, setBrand] = useState(existing?.brand ?? '')
  const [name, setName] = useState(existing?.name ?? '')
  const [size, setSize] = useState(existing?.size ?? '')
  const [condition, setCondition] = useState<Listing['condition']>(existing?.condition ?? '거의 새것')
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '')
  const [discountedPrice, setDiscountedPrice] = useState(
    existing?.discountedPrice != null ? String(existing.discountedPrice) : '',
  )
  const [points, setPoints] = useState(existing?.points != null ? String(existing.points) : '')
  const [pointsTouched, setPointsTouched] = useState(false)
  const [description, setDescription] = useState(existing?.description ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (pointsTouched) return
    setPoints(suggestPoints(Number(discountedPrice)))
  }, [discountedPrice, pointsTouched])

  const handlePickImage = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!name.trim() || !size.trim() || !discountedPrice) {
      setError('상품명, 사이즈, 판매가는 꼭 입력해주세요.')
      return
    }
    setError('')

    const input: ListingInput = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      size: size.trim(),
      condition,
      price: price ? Number(price) : undefined,
      discountedPrice: Number(discountedPrice),
      points: points ? Number(points) : 0,
      description: description.trim() || undefined,
      imageUrl: image || undefined,
    }

    if (isEdit && existing) {
      updateListing(existing.id, input)
      navigate(`/market/${existing.id}`, { replace: true })
    } else {
      const newId = addListing(input)
      navigate(`/market/${newId}`, { replace: true })
    }
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
        <h1 className="text-sm font-medium text-ink-900">{isEdit ? '판매글 수정' : '판매글 등록'}</h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-28">
        <button
          type="button"
          onClick={handlePickImage}
          className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-moss-200 bg-moss-50"
        >
          {image ? (
            <img src={image} alt="상품 사진" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1.5 text-moss-500">
              <Camera size={22} />
              <span className="text-xs">사진 추가</span>
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <Field label="브랜드">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="예: uniqlo (선택)"
            className="input"
          />
        </Field>

        <Field label="상품명 *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품명을 입력하세요"
            className="input"
          />
        </Field>

        <div className="flex gap-3">
          <Field label="사이즈 *" className="flex-1">
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="예: M, 270, Free"
              className="input"
            />
          </Field>
          <Field label="상태" className="flex-1">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as Listing['condition'])}
              className="input"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex gap-3">
          <Field label="정가" className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="선택"
              className="input"
            />
          </Field>
          <Field label="판매가 *" className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="0"
              className="input"
            />
          </Field>
        </div>

        <Field label="적립 EP">
          <input
            type="number"
            inputMode="numeric"
            value={points}
            onChange={(e) => {
              setPointsTouched(true)
              setPoints(e.target.value)
            }}
            placeholder="0"
            className="input"
          />
        </Field>

        <Field label="상품 설명">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="상품 상태, 거래 방식 등을 자유롭게 적어주세요"
            rows={4}
            className="input resize-none"
          />
        </Field>

        {error && <p className="text-xs font-medium text-clay-600">{error}</p>}
      </div>

      <div className="sticky bottom-0 border-t border-moss-100 bg-sand-50/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-sand-50 active:bg-clay-600"
        >
          {isEdit ? '수정 완료' : '등록하기'}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-moss-600">{label}</p>
      {children}
    </div>
  )
}
