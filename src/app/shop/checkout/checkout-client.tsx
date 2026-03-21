'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CartItem } from '@/types'

const C = {
  bg:'#0D1117', surface:'#161B22', card:'#1C2333', border:'#2A3444',
  text:'#E6EDF3', muted:'#8B949E', dim:'#484F58',
  accent:'#00E5C7', ok:'#3FB950', orange:'#FFA657',
  accentDim:'rgba(0,229,199,0.12)', okDim:'rgba(63,185,80,0.12)',
}

type Step = 'form' | 'payment' | 'processing' | 'success'

export default function CheckoutClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sellerId = params.get('seller') || (typeof window !== 'undefined' ? localStorage.getItem('seller_id') : '') || 'demo'

  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<Step>('form')
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]')
    if (!stored.length) { router.push('/shop/cart?seller=' + sellerId); return }
    setCart(stored)
    const phone = localStorage.getItem('buyer_phone') || ''
    setForm(f => ({ ...f, phone }))
  }, [])

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0)

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.phone.trim()) e.phone = 'Введите телефон'
    if (!form.address.trim()) e.address = 'Введите адрес'
    setErrors(e)
    return !Object.keys(e).length
  }

  const validateCard = () => {
    const e: Record<string, string> = {}
    if (card.number.replace(/\s/g,'').length < 16) e.number = 'Введите номер карты'
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Формат ММ/ГГ'
    if (card.cvv.length < 3) e.cvv = 'CVV'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleFormNext = () => { if (validateForm()) setStep('payment') }

  const handlePay = async () => {
    if (!validateCard()) return
    setStep('processing')
    await new Promise(r => setTimeout(r, 2200))
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          buyer_name: form.name,
          buyer_phone: form.phone,
          buyer_address: form.address,
          items: cart.map(i => ({ name: i.product.name, price: i.product.price, size: i.size, quantity: i.quantity })),
          total_price: total,
          is_ai_buyer: false,
        })
      })
      const data = await res.json()
      const oid = data.order_id || 'demo_' + Date.now()
      setOrderId(oid)
      const ids = JSON.parse(localStorage.getItem('order_ids') || '[]')
      ids.push(oid)
      localStorage.setItem('order_ids', JSON.stringify(ids))
    } catch {
      const oid = 'demo_' + Date.now()
      setOrderId(oid)
      const ids = JSON.parse(localStorage.getItem('order_ids') || '[]')
      ids.push(oid)
      localStorage.setItem('order_ids', JSON.stringify(ids))
    }
    localStorage.setItem('cart', '[]')
    setStep('success')
  }

  const formatCard = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  if (step === 'processing') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:56, height:56, border:`3px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:C.text, fontSize:16, fontWeight:600 }}>Обрабатываем оплату...</p>
      <p style={{ color:C.muted, fontSize:13 }}>Демо-режим · данные не передаются</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (step === 'success') return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24 }}>
      <div style={{ fontSize:72 }}>✅</div>
      <p style={{ fontSize:22, fontWeight:800, color:C.text }}>Оплата прошла!</p>
      <p style={{ fontSize:14, color:C.muted, textAlign:'center' }}>Заказ #{String(orderId).slice(-8).toUpperCase()} оформлен</p>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:16, width:'100%', maxWidth:360 }}>
        <p style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Доставка по адресу:</p>
        <p style={{ fontSize:14, color:C.text, fontWeight:500 }}>{form.address}</p>
        <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:C.muted }}>Итого</span>
          <span style={{ fontSize:16, fontWeight:800, color:C.accent }}>{total.toLocaleString('ru')} ₽</span>
        </div>
      </div>
      <button onClick={() => router.push('/shop/orders?seller=' + sellerId)} style={{ background:C.accent, color:C.bg, border:'none', borderRadius:12, padding:'14px 32px', fontWeight:700, fontSize:15, cursor:'pointer', marginTop:8 }}>
        Мои заказы
      </button>
      <button onClick={() => router.push('/shop?seller=' + sellerId)} style={{ background:'none', color:C.muted, border:'none', fontSize:13, cursor:'pointer' }}>
        Продолжить покупки
      </button>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg }}>
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => step === 'payment' ? setStep('form') : router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:20 }}>←</button>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>{step === 'form' ? 'Оформление' : 'Оплата'}</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {['form','payment'].map((s) => (
            <div key={s} style={{ width:24, height:4, borderRadius:2, background: step === s ? C.accent : C.border }} />
          ))}
        </div>
      </div>

      <div style={{ flex:1, padding:'16px 16px 120px', maxWidth:480, margin:'0 auto', width:'100%' }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:14, marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.accent, marginBottom:10 }}>Ваш заказ</p>
          {cart.map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <p style={{ fontSize:13, color:C.text, fontWeight:500 }}>{item.product.name}</p>
                <p style={{ fontSize:11, color:C.muted }}>Размер {item.size}</p>
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:C.text }}>{item.product.price.toLocaleString('ru')} ₽</p>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:8, paddingTop:10, display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, color:C.muted }}>Итого</span>
            <span style={{ fontSize:18, fontWeight:800, color:C.text }}>{total.toLocaleString('ru')} ₽</span>
          </div>
        </div>

        {step === 'form' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:13, fontWeight:700, color:C.text }}>Данные доставки</p>
            {[
              { key:'name', label:'Имя и фамилия', placeholder:'Алина Соколова', type:'text' },
              { key:'phone', label:'Телефон', placeholder:'+7 900 000 00 00', type:'tel' },
              { key:'address', label:'Адрес доставки', placeholder:'Москва, ул. Пушкина, д.1, кв.1', type:'text' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width:'100%', background:C.card, border:`1px solid ${errors[f.key] ? C.orange : C.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, color:C.text, outline:'none', boxSizing:'border-box' }}
                />
                {errors[f.key] && <p style={{ fontSize:11, color:C.orange, marginTop:4 }}>{errors[f.key]}</p>}
              </div>
            ))}
          </div>
        )}

        {step === 'payment' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.text }}>Данные карты</p>
              <span style={{ fontSize:11, color:C.muted, background:C.card, border:`1px solid ${C.border}`, borderRadius:6, padding:'3px 8px' }}>🔒 Демо-режим</span>
            </div>
            <div style={{ background:`linear-gradient(135deg, #1a2744 0%, #0d1a33 100%)`, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 20px 16px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(0,229,199,0.06)' }} />
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:16, letterSpacing:1 }}>AIMEE PAY · DEMO</p>
              <p style={{ fontSize:20, fontWeight:600, color:'#fff', letterSpacing:3, fontFamily:'monospace', marginBottom:20 }}>{card.number || '•••• •••• •••• ••••'}</p>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>ДЕРЖАТЕЛЬ</p><p style={{ fontSize:12, color:'#fff' }}>{form.name.toUpperCase() || 'ВАШЕ ИМЯ'}</p></div>
                <div style={{ textAlign:'right' }}><p style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>СРОК</p><p style={{ fontSize:12, color:'#fff' }}>{card.expiry || 'ММ/ГГ'}</p></div>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>Номер карты</label>
              <input placeholder="0000 0000 0000 0000" value={card.number} onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))} inputMode="numeric"
                style={{ width:'100%', background:C.card, border:`1px solid ${errors.number ? C.orange : C.border}`, borderRadius:10, padding:'12px 14px', fontSize:16, color:C.text, outline:'none', boxSizing:'border-box', fontFamily:'monospace', letterSpacing:2 }} />
              {errors.number && <p style={{ fontSize:11, color:C.orange, marginTop:4 }}>{errors.number}</p>}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>Срок</label>
                <input placeholder="ММ/ГГ" value={card.expiry} onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} inputMode="numeric"
                  style={{ width:'100%', background:C.card, border:`1px solid ${errors.expiry ? C.orange : C.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, color:C.text, outline:'none', boxSizing:'border-box' }} />
                {errors.expiry && <p style={{ fontSize:11, color:C.orange, marginTop:4 }}>{errors.expiry}</p>}
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }}>CVV</label>
                <input placeholder="•••" value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,3) }))} inputMode="numeric" type="password"
                  style={{ width:'100%', background:C.card, border:`1px solid ${errors.cvv ? C.orange : C.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, color:C.text, outline:'none', boxSizing:'border-box' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.bg, borderTop:`1px solid ${C.border}`, padding:'12px 16px 32px' }}>
        {step === 'form' && (
          <button onClick={handleFormNext} style={{ width:'100%', padding:14, borderRadius:14, fontSize:15, fontWeight:700, background:C.accent, color:C.bg, border:'none', cursor:'pointer' }}>
            Далее → Оплата
          </button>
        )}
        {step === 'payment' && (
          <button onClick={handlePay} style={{ width:'100%', padding:14, borderRadius:14, fontSize:15, fontWeight:700, background:C.accent, color:C.bg, border:'none', cursor:'pointer' }}>
            Оплатить {total.toLocaleString('ru')} ₽
          </button>
        )}
      </div>
    </div>
  )
}
