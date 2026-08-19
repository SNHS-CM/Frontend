import { ArrowLeft, Camera, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useListings, type ListingInput } from '../context/ListingsContext'
import { resolveListingImage, type Listing } from '../data/listings'

const CONDITIONS: Listing['condition'][] = ['새상품', '거의 새것', '사용감 조금 있음', '사용감 있음']

/** Same rule the server applies when `points` is left out of the request, run
 *  here so the field can fill in while the seller types. */
function suggestPoints(discountedPrice: number) {
  if (!discountedPrice) return ''
  return String(Math.max(10, Math.round((50 + discountedPrice / 3000) / 5) * 5))
}

const messageOf = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback

/** Resolves which listing is being edited before the form mounts, so the fields
 *  are only ever initialized once — an edit link can land here before the market
 *  has loaded. */
export default function ListingForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { listings, fetchListing } = useListings()
  const [notFound, setNotFound] = useState(false)

  const existing = isEdit ? listings.find((l) => l.id === id) : undefined

  useEffect(() => {
    if (!isEdit || existing || !id) return
    let cancelled = false
    void fetchListing(id).then((found) => {
      if (!cancelled && !found) setNotFound(true)
    })
    return () => {
      cancelled = true
    }
  }, [isEdit, id, existing, fetchListing])

  if (notFound) return <Navigate to="/market" replace />
  if (isEdit && !existing) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-moss-500">
        불러오는 중…
      </div>
    )
  }

  return <Form key={existing?.id ?? 'new'} existing={existing} />
}

function Form({ existing }: { existing?: Listing }) {
  const navigate = useNavigate()
  const { addListing, updateListing, removeListing } = useListings()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // The picked file is uploaded separately after the listing is saved; `preview`
  // is only what the screen shows in the meantime.
  const [preview, setPreview] = useState(existing ? resolveListingImage(existing) : '')
  const [photo, setPhoto] = useState<File | null>(null)

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
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (pointsTouched) return
    setPoints(suggestPoints(Number(discountedPrice)))
  }, [discountedPrice, pointsTouched])

  const handlePickImage = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (busy) return

    if (!name.trim() || !size.trim() || !discountedPrice) {
      setError('상품명, 사이즈, 판매가는 꼭 입력해주세요.')
      return
    }
    const listPrice = price ? Number(price) : undefined
    const sellPrice = Number(discountedPrice)
    // The server rejects this too; catching it here saves a round trip.
    if (listPrice != null && sellPrice > listPrice) {
      setError('판매가는 정가보다 클 수 없어요.')
      return
    }

    setError('')
    setBusy(true)

    const input: ListingInput = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      size: size.trim(),
      condition,
      price: listPrice,
      discountedPrice: sellPrice,
      points: points ? Number(points) : 0,
      description: description.trim() || undefined,
    }

    try {
      if (existing) {
        await updateListing(existing.id, input, photo)
        navigate(`/market/${existing.id}`, { replace: true })
      } else {
        const newId = await addListing(input, photo)
        navigate(`/market/${newId}`, { replace: true })
      }
      // Navigating unmounts the form, so `busy` is deliberately left set.
    } catch (err) {
      setError(messageOf(err, '저장하지 못했어요. 잠시 후 다시 시도해 주세요.'))
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!existing || busy) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setError('')
    setBusy(true)
    try {
      await removeListing(existing.id)
      navigate('/market', { replace: true })
    } catch (err) {
      setError(messageOf(err, '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.'))
      setConfirmDelete(false)
      setBusy(false)
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
        <h1 className="text-sm font-medium text-ink-900">
          {existing ? '판매글 수정' : '판매글 등록'}
        </h1>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 pb-28">
        <button
          type="button"
          onClick={handlePickImage}
          className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-moss-200 bg-moss-50"
        >
          {preview ? (
            <img src={preview} alt="상품 사진" className="h-full w-full object-cover" />
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

        {error && (
          <p role="alert" className="whitespace-pre-line text-xs font-medium text-clay-600">
            {error}
          </p>
        )}

        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={`flex w-full items-center justify-center gap-1.5 rounded-full border py-3 text-sm font-medium disabled:opacity-40 ${
              confirmDelete
                ? 'border-clay-500 bg-clay-500 text-sand-50'
                : 'border-moss-200 text-clay-600'
            }`}
          >
            <Trash2 size={15} />
            {confirmDelete ? '정말 삭제할까요? 한 번 더 누르기' : '판매글 삭제'}
          </button>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-moss-100 bg-sand-50/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          className="w-full rounded-full bg-clay-500 py-3.5 text-sm font-semibold text-sand-50 active:bg-clay-600 disabled:opacity-50"
        >
          {busy ? '저장 중…' : existing ? '수정 완료' : '등록하기'}
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
