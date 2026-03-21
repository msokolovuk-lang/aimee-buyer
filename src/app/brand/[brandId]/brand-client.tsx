'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase, trackActivity } from '@/lib/supabase'
import { C, DEMO_PRODUCTS, DEMO_BRAND } from '@/lib/config'

export default function BrandClient() {
  const router = useRouter()
  const { brandId } = useParams<{ brandId: string }>()
  const params = useSearchParams()
  const sellerId = params.get('seller') || brandId || 'demo'

  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [following, setFollowing] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const buyerPhone = typeof window !== 'undefined' ? localStorage.getItem('buyer_phone') || '' : ''

  useEffect(() => {
    setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length)
    const followed = JSON.parse(localStorage.getItem('followed_brands') || '[]')
    setFollowing(followed.includes(sellerId))
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data } = await supabase.from('products').select('*').eq('seller_id', sellerId).eq('in_stock', true)
      if (data?.length) setProducts(data as typeof DEMO_PRODUCTS)
    } catch {}
  }

  const handleFollow = () => {
    const followed = JSON.parse(localStorage.getItem('followed_brands') || '[]')
    if (following) {
      localStorage.setItem('followed_brands', JSON.stringify(followed.filter((id: string) => id !== sellerId)))
    } else {
      followed.push(sellerId)
      localStorage.setItem('followed_brands', JSON.stringify(followed))
    }
    setFollowing(!following)
  }

  const handleView = async (p: typeof DEMO_PRODUCTS[0]) => {
    await trackActivity(sellerId, buyerPhone, 'view', { product_id: p.id, product_name: p.name, price: p.price, source: 'brand_page' })
    router.push('/shop/' + p.id + '?seller=' + sellerId)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      {/* Back header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', flexShrink:0 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:20 }}>←</button>
        <span style={{ fontSize:14, fontWeight:700, color:C.text }}>О бренде</span>
        <button onClick={() => router.push('/shop/cart?seller=' + sellerId)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:20, position:'relative' }}>
          🛍️
          {cartCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, background:C.accent, color:C.bg, fontSize:9, fontWeight:800, width:15, height:15, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:24 }}>
        {/* Brand hero */}
        <div style={{ background:`linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`, padding:'24px 20px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            {/* Brand logo */}
            <div style={{ width:72, height:72, borderRadius:16, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:18, fontWeight:900, color:'#111', letterSpacing:-1, fontFamily:'Georgia,serif' }}>N&R</span>
            </div>
            <div>
              <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{DEMO_BRAND.name}</p>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ fontSize:11, color:C.muted }}>📍 {DEMO_BRAND.location}</span>
                <span style={{ fontSize:11, color:C.muted }}>· с {DEMO_BRAND.founded}</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:16 }}>{DEMO_BRAND.description}</p>

          {/* Stats */}
          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            {[
              { label:'Товаров', value: products.length },
              { label:'Рейтинг', value: '4.8 ★' },
              { label:'Продаж', value: '2.4K' },
            ].map(s => (
              <div key={s.label} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px', textAlign:'center' }}>
                <p style={{ fontSize:16, fontWeight:800, color:C.text }}>{s.value}</p>
                <p style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleFollow} style={{
              flex:1, padding:'11px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer',
              background: following ? C.accentDim : C.accent,
              color: following ? C.accent : C.bg,
              border: `1px solid ${C.accent}`,
            }}>
              {following ? '✓ Следите' : '+ Следить за брендом'}
            </button>
            <button onClick={() => router.push('/stylist?seller=' + sellerId)} style={{
              padding:'11px 16px', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer',
              background:C.card, color:C.text, border:`1px solid ${C.border}`,
            }}>
              ✦ Стилист
            </button>
          </div>

          {/* Future: Virtual try-on teaser */}
          <div style={{ marginTop:12, padding:'10px 14px', borderRadius:12, background:C.pinkDim, border:`1px solid ${C.pink}30`, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>👗</span>
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:C.pink }}>Виртуальная примерка</p>
              <p style={{ fontSize:10, color:C.muted }}>Скоро — примеряйте вещи бренда не выходя из дома</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div style={{ padding:'16px 12px 0' }}>
          <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:12, paddingLeft:2 }}>Все товары бренда</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {products.map(p => (
              <button key={p.id} onClick={() => handleView(p)} style={{
                background:C.card, border:`1px solid ${C.border}`, borderRadius:14,
                overflow:'hidden', textAlign:'left', cursor:'pointer', padding:0,
              }}>
                <div style={{ aspectRatio:'4/5', background:C.surface, position:'relative', overflow:'hidden' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>👗</div>
                  }
                  {p.canNegotiate && (
                    <div style={{ position:'absolute', top:8, right:8, background:'rgba(255,166,87,0.9)', borderRadius:99, padding:'2px 7px', fontSize:9, fontWeight:700, color:'#111' }}>💬 A2A</div>
                  )}
                </div>
                <div style={{ padding:'10px 10px 12px' }}>
                  <span style={{ fontSize:9, fontWeight:600, color:C.accent, background:C.accentDim, padding:'1px 6px', borderRadius:99, display:'inline-block', marginBottom:5 }}>{p.category}</span>
                  <p style={{ fontSize:12, fontWeight:600, color:C.text, lineHeight:1.3, marginBottom:5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{p.name}</p>
                  <p style={{ fontSize:14, fontWeight:800, color:C.text }}>{p.price.toLocaleString('ru')} ₽</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
