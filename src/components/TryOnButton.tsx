'use client'

import { useState, useRef } from 'react'
import { C } from '@/lib/config'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  brand?: string
  sizes: string[]
}

interface Outfit {
  title: string
  products: Product[]
  discount?: number
}

interface Props {
  outfit: Outfit
  onAddAllToCart: (products: Product[], discount: number) => void
  onViewProduct: (product: Product) => void
  singleItem?: boolean
}

export default function TryOnButton({ outfit, onAddAllToCart, onViewProduct, singleItem = false }: Props) {
  const [state, setstate] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const handleTryOn = async () => {
    const userPhoto = typeof window !== 'undefined' ? localStorage.getItem('user_photo_base64') : null
    if (!userPhoto) {
      alert('Для примерки нужно загрузить фото в настройках профиля')
      return
    }

    setstate('loading')
    setProgress(5)

    try {
      const mainGarment = outfit.products.find(p =>
        ['платья','блузки','рубашки','трикотаж','футболки'].some(c => p.category.toLowerCase().includes(c))
      ) || outfit.products[0]

      const garmentUrl = mainGarment.images?.[0]
      if (!garmentUrl) throw new Error('No garment image')

      // Step 1: Start prediction (fast, < 3s)
      const startRes = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personPhotoBase64: userPhoto,
          garmentImageUrl: garmentUrl,
          category: getCategoryType(mainGarment.category),
        }),
      })
      const startData = await startRes.json()
      if (!startData.predictionId) throw new Error(startData.error || 'Failed to start')

      setProgress(15)

      // Step 2: Poll status on client (no server timeout issue)
      const predId = startData.predictionId
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 3000))
        setProgress(Math.min(15 + i * 2, 90))

        const pollRes = await fetch(`/api/tryon?id=${predId}`)
        const pollData = await pollRes.json()

        if ((pollData.status === 'completed' || pollData.status === 'succeeded') && pollData.imageUrl) {
          setProgress(100)
          setResultImage(pollData.imageUrl)
          setstate('done')
          setShowResult(true)
          return
        }
        if (pollData.status === 'failed' || pollData.status === 'canceled') {
          throw new Error(pollData.error || 'Generation failed')
        }
      }
      throw new Error('Timeout')
    } catch (err) {
      console.error(err)
      setstate('error')
      if (err instanceof Error && err.message.includes('Фото не загружено')) {
        alert('Для примерки нужно загрузить фото в онбординге. Нажмите ⚙️ чтобы обновить профиль.')
      }
    }
  }

  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      // Compress
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height, max = 1200
        if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w = max } else { w = Math.round(w*max/h); h = max } }
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const b64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
        localStorage.setItem('user_photo_base64', b64)
        // Auto-start try-on
        handleTryOn()
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const getCategoryType = (category: string): string => {
    const cat = category.toLowerCase()
    if (['платья','комбинезон'].some(c => cat.includes(c))) return 'dresses'
    if (['джинсы','брюки','юбки'].some(c => cat.includes(c))) return 'lower_body'
    return 'upper_body'
  }

  const totalPrice = outfit.products.reduce((s, p) => s + p.price, 0)
  const discountedPrice = Math.round(totalPrice * (1 - (outfit.discount || 15) / 100))

  return (
    <>
      {/* Try-on button */}
      <button
        onClick={() => {
          if (state === 'done') { setShowResult(true); return }
          const photo = typeof window !== 'undefined' ? localStorage.getItem('user_photo_base64') : null
          if (!photo && state === 'idle') {
            fileRef.current?.click()
          } else {
            handleTryOn()
          }
        }}
        disabled={state === 'loading'}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: `1px solid ${C.pink}40`,
          background: state === 'loading' ? C.card : C.pinkDim,
          cursor: state === 'loading' ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {state === 'loading' ? (
          <>
            <div style={{ width: 16, height: 16, border: `2px solid ${C.pink}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.pink, marginBottom: 4 }}>Примеряем образ... {progress}%</p>
              <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
                <div style={{ height: '100%', background: C.pink, borderRadius: 2, width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </>
        ) : state === 'error' ? (
          <>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.orange }}>Ошибка примерки</p>
              <p style={{ fontSize: 10, color: C.muted }}>Нажмите чтобы попробовать снова</p>
            </div>
          </>
        ) : state === 'done' ? (
          <>
            <span style={{ fontSize: 16 }}>✨</span>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.pink }}>Посмотреть примерку →</p>
          </>
        ) : (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUploadPhoto} style={{ display:'none' }} />
            <span style={{ fontSize: 18 }}>👗</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.pink }}>
                Примерить образ на себе
              </p>
              <p style={{ fontSize: 10, color: C.muted }}>AI сгенерирует вас в этом луке</p>
            </div>
          </>
        )}
      </button>

      {/* Result modal */}
      {showResult && resultImage && (
        <>
          <div onClick={() => setShowResult(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
            background: C.surface, borderRadius: '20px 20px 0 0',
            maxHeight: '90vh', overflowY: 'auto',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
            </div>

            <div style={{ padding: '0 16px 20px' }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>✨ Вот как вы выглядите!</p>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{outfit.title}</p>

              {/* Generated image */}
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, position: 'relative' }}>
                <img src={resultImage} alt="Try-on result" style={{ width: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(13,17,23,0.8)', borderRadius: 99, padding: '3px 10px', fontSize: 10, color: C.muted }}>
                  ✨ AIMEE AI
                </div>
              </div>

              {/* Outfit products */}
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 8 }}>ВЕЩИ ИЗ ОБРАЗА</p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
                {outfit.products.map(p => (
                  <button key={p.id} onClick={() => { setShowResult(false); onViewProduct(p) }} style={{
                    flexShrink: 0, width: 100, background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 10, overflow: 'hidden', padding: 0, cursor: 'pointer',
                  }}>
                    <div style={{ height: 80, background: C.bg }}>
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ padding: '6px 8px' }}>
                      <p style={{ fontSize: 9, color: C.accent, fontWeight: 600, marginBottom: 2 }}>{p.brand || 'N&R'}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.text, marginTop: 2 }}>{p.price.toLocaleString('ru')} ₽</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Price + CTA */}
              {singleItem ? (
                <button
                  onClick={() => { onAddAllToCart(outfit.products, 0); setShowResult(false) }}
                  style={{ width:'100%', padding:14, borderRadius:12, background:C.accent, color:C.bg, border:'none', fontSize:14, fontWeight:800, cursor:'pointer', marginBottom:12 }}
                >
                  В корзину → {totalPrice.toLocaleString('ru')} ₽
                </button>
              ) : (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 11, color: C.muted }}>Весь образ</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14, color: C.muted, textDecoration: 'line-through' }}>{totalPrice.toLocaleString('ru')} ₽</p>
                        <p style={{ fontSize: 20, fontWeight: 900, color: C.ok }}>{discountedPrice.toLocaleString('ru')} ₽</p>
                      </div>
                    </div>
                    <div style={{ background: C.okDim, border: `1px solid ${C.ok}40`, borderRadius: 99, padding: '4px 12px' }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: C.ok }}>-{outfit.discount || 15}%</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onAddAllToCart(outfit.products, outfit.discount || 15); setShowResult(false) }}
                    style={{ width: '100%', padding: 14, borderRadius: 12, background: C.accent, color: C.bg, border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Взять весь образ → {discountedPrice.toLocaleString('ru')} ₽
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowResult(false)}
                style={{ width: '100%', padding: 12, borderRadius: 12, background: 'none', border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, cursor: 'pointer' }}
              >
                Выбрать по отдельности
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
