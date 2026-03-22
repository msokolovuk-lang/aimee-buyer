'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase, trackActivity } from '@/lib/supabase'
import TryOnButton from '@/components/TryOnButton'

const C = {
  bg:'#0D1117', surface:'#161B22', card:'#1C2333', border:'#2A3444',
  text:'#E6EDF3', muted:'#8B949E', dim:'#484F58',
  accent:'#00E5C7', accentDim:'rgba(0,229,199,0.12)',
  ok:'#3FB950', okDim:'rgba(63,185,80,0.12)',
  orange:'#FFA657', orangeDim:'rgba(255,166,87,0.12)',
}

export default function ProductClient() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const params = useSearchParams()
  const sellerIdFromUrl = params.get('seller') || ''

  const [product, setProduct] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [imgIndex, setImgIndex] = useState(0)
  const buyerPhone = typeof window !== 'undefined' ? localStorage.getItem('buyer_phone') || '' : ''

  useEffect(() => {
    setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length)
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        // normalize sizes: может быть строкой или массивом
        if (typeof data.sizes === 'string') {
          data.sizes = data.sizes.split(',').map((s: string) => s.trim()).filter(Boolean)
        }
        setProduct(data)
        // seller_id из продукта — приоритет над URL
        const effectiveSellerId = data.seller_id || sellerIdFromUrl
        // получаем brand_name отдельно
        if (data.seller_id) {
          const { data: seller } = await supabase.from('sellers').select('brand_name').eq('seller_id', data.seller_id).single()
          setBrandName(seller?.brand_name || data.brand || '')
        }
        // автовыбор размера из профиля
        const profile = JSON.parse(localStorage.getItem('user_profile') || 'null')
        if (profile?.sizes && data.sizes?.length) {
          const cat = (data.category || '').toLowerCase()
          let rec = ''
          if (['платья','блузки','рубашки','трикотаж','футболки'].some(c => cat.includes(c))) rec = profile.sizes.tops
          else if (['джинсы','брюки'].some(c => cat.includes(c))) rec = profile.sizes.jeans
          else if (['юбки'].some(c => cat.includes(c))) rec = profile.sizes.bottoms
          if (rec && data.sizes.includes(rec)) setSelectedSize(rec)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product: { ...product, price: Number(product.price) }, size: selectedSize, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.length)
    setAdded(true)
    await trackActivity(product?.seller_id || sellerIdFromUrl, buyerPhone, 'add_to_cart', {
      product_id: product.id, product_name: product.name, size: selectedSize, price: product.price
    })
    setTimeout(() => router.push('/shop/cart?seller='+(product?.seller_id || sellerIdFromUrl)), 800)
  }

  if (!product) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:`2px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const images = Array.isArray(product.images) ? product.images : []

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', flexShrink:0, zIndex:10 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:20, padding:4 }}>←</button>
        <span style={{ fontSize:14, fontWeight:600, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:C.muted }}>{brandName}</span>
        <button onClick={() => router.push('/shop/cart?seller='+(product?.seller_id || sellerIdFromUrl))} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, position:'relative', padding:4 }}>
          🛍️
          {cartCount > 0 && <span style={{ position:'absolute', top:-2, right:-2, background:C.accent, color:C.bg, fontSize:9, fontWeight:800, width:15, height:15, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:100 }}>
        {/* Image */}
        <div style={{ position:'relative', background:C.card, overflow:'hidden' }}>
          <div style={{ aspectRatio:'4/5', maxHeight:420, overflow:'hidden' }}>
            {images.length > 0
              ? <img src={images[imgIndex]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, minHeight:320 }}>👗</div>
            }
          </div>
          {/* Image dots */}
          {images.length > 1 && (
            <div style={{ position:'absolute', bottom:12, left:0, right:0, display:'flex', justifyContent:'center', gap:5 }}>
              {images.map((_:any, i:number) => (
                <button key={i} onClick={() => setImgIndex(i)} style={{ width: i===imgIndex ? 20 : 6, height:6, borderRadius:3, background: i===imgIndex ? C.accent : 'rgba(255,255,255,0.4)', border:'none', cursor:'pointer', padding:0, transition:'all 0.2s' }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:'16px 16px 0' }}>
          {/* Brand */}
          {brandName && <p style={{ fontSize:12, color:C.accent, fontWeight:600, marginBottom:6 }}>{brandName}</p>}

          {/* Name & Price */}
          <h1 style={{ fontSize:20, fontWeight:800, color:C.text, lineHeight:1.3, marginBottom:8 }}>{product.name}</h1>
          <p style={{ fontSize:26, fontWeight:800, color:C.text, marginBottom:12 }}>{Number(product.price).toLocaleString('ru')} ₽</p>

          {product.description && (
            <p style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.muted, marginBottom:10 }}>
                Размер {selectedSize && <span style={{ color:C.accent }}>· {selectedSize}</span>}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding:'10px 20px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
                      background: selectedSize === s ? C.accent : C.card,
                      color: selectedSize === s ? C.bg : C.text,
                      border: `1.5px solid ${selectedSize === s ? C.accent : C.border}`,
                      transition:'all 0.15s',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Try-On */}
          {product.images?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <TryOnButton
                singleItem={true}
                outfit={{ title: product.name, products: [product], discount: 0 }}
                onAddAllToCart={(products: any[]) => {
                  const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                  products.forEach((p: any) => cart.push({ product: { ...p, price: Number(p.price) }, size: selectedSize || '', quantity: 1 }))
                  localStorage.setItem('cart', JSON.stringify(cart))
                }}
                onViewProduct={() => {}}
              />
            </div>
          )}

          {/* Delivery info */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:16 }}>🚚</span>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:C.text }}>Доставка 3–7 дней</p>
                <p style={{ fontSize:11, color:C.muted }}>По всей России</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:16 }}>↩️</span>
              <p style={{ fontSize:12, color:C.muted }}>Возврат в течение 14 дней</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.bg, borderTop:`1px solid ${C.border}`, padding:'12px 16px 32px' }}>
        {!selectedSize ? (
          <div style={{ display:'flex', gap:8 }}>
            {product.sizes?.slice(0,4).map((s: string) => (
              <button key={s} onClick={() => setSelectedSize(s)} style={{
                flex:1, padding:12, borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
                background:C.card, color:C.text, border:`1.5px solid ${C.border}`,
              }}>{s}</button>
            ))}
            {product.sizes?.length > 4 && (
              <button onClick={() => {}} style={{ padding:'12px 10px', borderRadius:12, fontSize:12, fontWeight:600, cursor:'pointer', background:C.card, color:C.muted, border:`1px solid ${C.border}` }}>···</button>
            )}
          </div>
        ) : (
          <button onClick={handleAddToCart} disabled={added} style={{
            width:'100%', padding:16, borderRadius:14, fontSize:16, fontWeight:800,
            background: added ? C.ok : C.accent, color:C.bg, border:'none', cursor:'pointer',
            transition:'all 0.2s',
          }}>
            {added ? '✓ Добавлено!' : `В корзину · ${Number(product.price).toLocaleString('ru')} ₽`}
          </button>
        )}
      </div>
    </div>
  )
}
