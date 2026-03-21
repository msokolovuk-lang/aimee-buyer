'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = {
  bg:'#0D1117', surface:'#161B22', card:'#1C2333', border:'#2A3444',
  text:'#E6EDF3', muted:'#8B949E', dim:'#484F58',
  accent:'#00E5C7', accentDim:'rgba(0,229,199,0.12)',
  orange:'#FFA657', orangeDim:'rgba(255,166,87,0.12)',
  ok:'#3FB950', okDim:'rgba(63,185,80,0.12)',
}

const STATUSES: Record<string, {label:string; color:string; bg:string; step:number}> = {
  new:       { label:'Принят',       color:C.accent,  bg:C.accentDim,  step:0 },
  confirmed: { label:'Подтверждён',  color:C.accent,  bg:C.accentDim,  step:1 },
  shipped:   { label:'В доставке',   color:C.orange,  bg:C.orangeDim,  step:2 },
  delivered: { label:'Доставлен',    color:C.ok,      bg:C.okDim,      step:3 },
  return_requested: { label:'Возврат',color:C.orange, bg:C.orangeDim,  step:0 },
  returned:  { label:'Возвращён',    color:C.muted,   bg:'rgba(139,148,158,0.12)', step:0 },
  pending:   { label:'Принят',       color:C.accent,  bg:C.accentDim,  step:0 },
}

const STEPS = ['Принят', 'Подтверждён', 'В доставке', 'Доставлен']

// генерируем фейковые даты трекинга на основе created_at
function getTrackingSteps(order: any) {
  const base = new Date(order.created_at)
  const fmt = (d: Date) => d.toLocaleDateString('ru', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
  const add = (d: Date, h: number) => new Date(d.getTime() + h * 3600000)
  return [
    { label:'Заказ принят', time: fmt(base), done: true },
    { label:'Передан на склад', time: fmt(add(base, 2)), done: true },
    { label:'Передан в доставку', time: fmt(add(base, 24)), done: false },
    { label:'Доставлен', time: 'Ожидается через 3–5 дней', done: false },
  ]
}

export default function OrdersClient() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string|null>(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const orderIds = JSON.parse(localStorage.getItem('order_ids') || '[]')
      const phone = localStorage.getItem('buyer_phone') || ''
      let data: any[] = []

      if (phone) {
        const { data: byPhone } = await supabase
          .from('orders').select('*')
          .eq('buyer_phone', phone)
          .order('created_at', { ascending: false })
        if (byPhone?.length) data = byPhone
      }

      if (!data.length && orderIds.length) {
        const { data: byIds } = await supabase
          .from('orders').select('*')
          .in('id', orderIds)
          .order('created_at', { ascending: false })
        if (byIds?.length) data = byIds
      }

      if (data.length) { setOrders(data); setLoading(false); return }
    } catch {}

    // fallback localStorage
    const local = JSON.parse(localStorage.getItem('orders') || '[]')
    setOrders([...local].reverse())
    setLoading(false)
  }

  const handleCancel = async (order: any) => {
    if (!confirm('Отменить заказ?')) return
    try {
      await supabase.from('orders').update({ status: 'returned' }).eq('id', order.id)
    } catch {}
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'returned' } : o))
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:`2px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg }}>
      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12, padding:'12px 16px', position:'sticky', top:0, zIndex:10 }}>
        <button onClick={() => router.back()} style={{ background:'none', border:'none', cursor:'pointer', color:C.text, fontSize:20 }}>←</button>
        <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Мои заказы</span>
        {orders.length > 0 && <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{orders.length} заказа</span>}
      </div>

      <div style={{ flex:1, padding:'12px 16px 32px' }}>
        {orders.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:80, gap:16 }}>
            <div style={{ fontSize:60 }}>📦</div>
            <p style={{ fontSize:16, fontWeight:600, color:C.text }}>Заказов пока нет</p>
            <p style={{ fontSize:13, color:C.muted }}>Найдите что-то в каталоге</p>
            <button onClick={() => router.push('/shop')} style={{ background:C.accent, color:C.bg, border:'none', borderRadius:12, padding:'12px 28px', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:8 }}>
              В каталог
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.map(order => {
              const st = STATUSES[order.status] || STATUSES.new
              const isOpen = expanded === order.id
              const tracking = getTrackingSteps(order)
              const canCancel = ['new','pending','confirmed'].includes(order.status)
              const items = Array.isArray(order.items) ? order.items : []
              const total = order.total_price || order.total || 0

              return (
                <div key={order.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
                  {/* Order header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ padding:'14px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}
                  >
                    <div>
                      <p style={{ fontSize:11, color:C.dim, fontFamily:'monospace', marginBottom:4 }}>
                        #{String(order.id).slice(-8).toUpperCase()}
                        {order.is_ai_buyer && <span style={{ marginLeft:8, background:'rgba(0,229,199,0.15)', color:C.accent, borderRadius:4, padding:'1px 6px', fontSize:10 }}>🤖 AI</span>}
                      </p>
                      <p style={{ fontSize:11, color:C.muted }}>
                        {new Date(order.created_at).toLocaleDateString('ru', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:600, color:st.color, background:st.bg }}>{st.label}</div>
                      <span style={{ color:C.muted, fontSize:12 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ padding:'0 16px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                    {items.map((item: any, i: number) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <p style={{ fontSize:13, color:C.text, fontWeight:500 }}>{item.name || item.product?.name}</p>
                          <p style={{ fontSize:11, color:C.muted }}>Размер {item.size} · {item.quantity || 1} шт.</p>
                        </div>
                        <p style={{ fontSize:13, fontWeight:600, color:C.muted }}>{(item.price || item.product?.price || 0).toLocaleString('ru')} ₽</p>
                      </div>
                    ))}
                    <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, color:C.muted }}>Итого</span>
                      <span style={{ fontSize:18, fontWeight:800, color:C.text }}>{total.toLocaleString('ru')} ₽</span>
                    </div>
                  </div>

                  {/* Expanded tracking */}
                  {isOpen && (
                    <div style={{ borderTop:`1px solid ${C.border}`, padding:'16px 16px 14px' }}>

                      {/* Progress bar */}
                      <div style={{ marginBottom:20 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                          {STEPS.map((step, i) => {
                            const done = i <= st.step
                            return (
                              <div key={step} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                                <div style={{ width:24, height:24, borderRadius:'50%', background: done ? C.accent : C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: done ? C.bg : C.muted, marginBottom:4, zIndex:1 }}>
                                  {done ? '✓' : i+1}
                                </div>
                                <p style={{ fontSize:9, color: done ? C.accent : C.muted, textAlign:'center', lineHeight:1.2 }}>{step}</p>
                              </div>
                            )
                          })}
                        </div>
                        <div style={{ height:2, background:C.border, borderRadius:1, marginTop:-28, marginBottom:20, position:'relative', zIndex:0 }}>
                          <div style={{ height:'100%', background:C.accent, borderRadius:1, width:`${(st.step / 3) * 100}%`, transition:'width 0.5s' }} />
                        </div>
                      </div>

                      {/* Timeline */}
                      <p style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>История</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                        {tracking.map((t, i) => (
                          <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background: t.done ? C.accent : C.border, marginTop:4, flexShrink:0 }} />
                            <div>
                              <p style={{ fontSize:13, color: t.done ? C.text : C.muted, fontWeight: t.done ? 600 : 400 }}>{t.label}</p>
                              <p style={{ fontSize:11, color:C.dim }}>{t.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Address */}
                      {order.buyer_address && (
                        <div style={{ background:C.surface, borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                          <p style={{ fontSize:10, color:C.muted, marginBottom:4 }}>Адрес доставки</p>
                          <p style={{ fontSize:13, color:C.text }}>{order.buyer_address}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          onClick={() => router.push('/shop')}
                          style={{ flex:1, padding:'10px 0', borderRadius:10, fontSize:13, fontWeight:600, background:C.accentDim, color:C.accent, border:`1px solid ${C.accent}30`, cursor:'pointer' }}
                        >
                          Купить ещё
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order)}
                            style={{ flex:1, padding:'10px 0', borderRadius:10, fontSize:13, fontWeight:600, background:C.orangeDim, color:C.orange, border:`1px solid ${C.orange}30`, cursor:'pointer' }}
                          >
                            Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
