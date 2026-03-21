'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, trackActivity } from '@/lib/supabase'
import { C } from '@/lib/config'
import BottomNav from '@/components/BottomNav'

const CATS = ['Все','Платья','Блузки','Джинсы','Юбки','Трикотаж','Футболки','Рубашки','Брюки','Верхняя одежда','Обувь','Аксессуары']

export default function CatalogClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sellerId = params.get('seller') || null

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('Все')
  const [search, setSearch] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [addedId, setAddedId] = useState<string|null>(null)
  const buyerPhone = typeof window !== 'undefined' ? localStorage.getItem('buyer_phone') || '' : ''

  useEffect(() => {
    setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length)
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (data) setProducts(data)
    } catch {}
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchCat = cat === 'Все' || p.category === cat
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleView = async (p: any) => {
    await trackActivity(p.seller_id || sellerId || '', buyerPhone, 'view', { product_id: p.id, product_name: p.name, price: p.price })
    router.push('/shop/' + p.id + (sellerId ? '?seller=' + sellerId : '?seller=' + p.seller_id))
  }

  const handleQuickAdd = async (e: React.MouseEvent, p: any) => {
    e.stopPropagation()
    const sizes = Array.isArray(p.sizes) ? p.sizes : (p.sizes || '').split(',').map((s:string) => s.trim()).filter(Boolean)
    const size = sizes[0] || 'OS'
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product: { ...p, price: Number(p.price) }, size, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.length)
    setAddedId(p.id)
    await trackActivity(p.seller_id || sellerId || '', buyerPhone, 'add_to_cart', { product_id: p.id, product_name: p.name, size, price: p.price })
    // не сбрасываем - галочка остаётся
  }

  const handleTab = (id: string) => {
    if (id === 'stylist') router.push('/stylist' + (sellerId ? '?seller=' + sellerId : ''))
    if (id === 'cart') router.push('/shop/cart' + (sellerId ? '?seller=' + sellerId : ''))
    if (id === 'profile') router.push('/profile' + (sellerId ? '?seller=' + sellerId : ''))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'14px 16px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <p style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:-0.5 }}>AIMEE</p>
          <button onClick={() => router.push('/shop/cart' + (sellerId ? '?seller=' + sellerId : ''))} style={{ background:'none', border:'none', cursor:'pointer', position:'relative', fontSize:22 }}>
            🛍️
            {cartCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, background:C.accent, color:C.bg, fontSize:9, fontWeight:800, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
          </button>
        </div>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:10 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:C.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
            style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'10px 12px 10px 36px', fontSize:14, color:C.text, outline:'none', boxSizing:'border-box' as const }} />
        </div>

        {/* Categories */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:12, scrollbarWidth:'none' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink:0, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer',
              background: cat === c ? C.accent : 'transparent',
              color: cat === c ? C.bg : C.muted,
              border: `1px solid ${cat === c ? C.accent : C.border}`,
              transition:'all 0.15s',
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 90px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:32, height:32, border:`2px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <p style={{ fontSize:40, marginBottom:12 }}>🔍</p>
            <p style={{ color:C.muted, fontSize:14 }}>Ничего не найдено</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {filtered.map(p => {
              const brandName = p.sellers?.brand_name || p.brand || ''
              const isAdded = addedId === p.id
              return (
                <div key={p.id} onClick={() => handleView(p)} style={{
                  background:C.card, border:`1px solid ${C.border}`, borderRadius:16,
                  overflow:'hidden', cursor:'pointer', position:'relative',
                }}>
                  {/* Image */}
                  <div style={{ aspectRatio:'3/4', background:C.surface, position:'relative', overflow:'hidden' }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>👗</div>
                    }
                    {/* Quick add button */}
                    <button onClick={(e) => handleQuickAdd(e, p)} style={{
                      position:'absolute', bottom:8, right:8,
                      width:36, height:36, borderRadius:'50%',
                      background: isAdded ? C.ok : C.accent,
                      border:'none', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, fontWeight:700, color:C.bg,
                      boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
                      transition:'all 0.2s',
                    }}>
                      {isAdded ? '✓' : '🛒'}
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding:'10px 10px 12px' }}>
                    {brandName && <p style={{ fontSize:10, color:C.accent, fontWeight:600, marginBottom:3 }}>{brandName}</p>}
                    <p style={{ fontSize:12, fontWeight:600, color:C.text, lineHeight:1.3, marginBottom:6,
                      overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{p.name}</p>
                    <p style={{ fontSize:15, fontWeight:800, color:C.text }}>{Number(p.price).toLocaleString('ru')} ₽</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav active="catalog" onTab={handleTab} cartCount={cartCount} />
    </div>
  )
}
