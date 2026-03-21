'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CartItem } from '@/types'

const C = {
  bg:'#0D1117', surface:'#161B22', card:'#1C2333', border:'#2A3444',
  text:'#E6EDF3', muted:'#8B949E', dim:'#484F58',
  accent:'#00E5C7', accentDim:'rgba(0,229,199,0.12)',
  ok:'#3FB950', okDim:'rgba(63,185,80,0.12)',
  pink:'#FF6B9D',
}

export default function CartClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sellerId = params.get('seller') || localStorage.getItem('seller_id') || 'demo'
  const buyerPhone = typeof window !== 'undefined' ? localStorage.getItem('buyer_phone') || '' : ''

  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => { setCart(JSON.parse(localStorage.getItem('cart') || '[]')) }, [])

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)

  const removeItem = (idx: number) => {
    const updated = cart.filter((_, i) => i !== idx)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const handleOrder = () => {
    if (!cart.length) return
    router.push('/shop/checkout?seller=' + sellerId)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', flexShrink:0 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:20 }}>←</button>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Корзина</span>
        {cart.length > 0 && <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{cart.length} товара</span>}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 100px' }}>
        {cart.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:80, gap:16 }}>
            <div style={{ fontSize:60 }}>🛒</div>
            <p style={{ fontSize:15, color:C.muted }}>Корзина пуста</p>
            <button onClick={() => router.push('/shop?seller=' + sellerId)} style={{ background:C.accent, color:C.bg, border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:14, cursor:'pointer' }}>В каталог</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {cart.map((item, i) => (
              <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14, display:'flex', gap:12, alignItems:'center' }}>
                <div style={{ width:56, height:56, borderRadius:10, background:C.surface, overflow:'hidden', flexShrink:0 }}>
                  {item.product.images?.[0]
                    ? <img src={item.product.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👗</div>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.product.name}</p>
                  <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Размер: {item.size}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:C.accent, marginTop:4 }}>{item.product.price.toLocaleString('ru')} ₽</p>
                </div>
                <button onClick={() => removeItem(i)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:C.dim, padding:4 }}>✕</button>
              </div>
            ))}

            {/* Total */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:C.muted }}>Итого</span>
              <span style={{ fontSize:20, fontWeight:800, color:C.text }}>{total.toLocaleString('ru')} ₽</span>
            </div>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.bg, borderTop:`1px solid ${C.border}`, padding:'12px 16px 28px' }}>
          <button onClick={handleOrder} style={{
            width:'100%', padding:14, borderRadius:14, fontSize:15, fontWeight:700,
            background:C.accent, color:C.bg, border:'none', cursor:'pointer', opacity: 1,
          }}>
            {`Перейти к оформлению · ${total.toLocaleString('ru')} ₽`}
          </button>
        </div>
      )}
    </div>
  )
}
