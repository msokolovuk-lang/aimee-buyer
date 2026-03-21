'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { C } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

const BRAND_OFFERS = [
  { id:'b1', brand:'N&R Collection', category:'Верхняя одежда', offer:'Пальто прямого кроя −20%', price:15120, oldPrice:18900, image:'https://images.unsplash.com/photo-1548624313-0396dc957a61?w=200&h=250&fit=crop', tag:'Для вас' },
  { id:'b2', brand:'Artem Krivda', category:'Трикотаж', offer:'Новая коллекция SS25', price:6200, oldPrice:null, image:'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=250&fit=crop', tag:'Новинка' },
  { id:'b3', brand:'12Storeez', category:'Платья', offer:'Лимитированная серия', price:9800, oldPrice:12500, image:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=250&fit=crop', tag:'Лимит' },
  { id:'b4', brand:'Жаклин', category:'Аксессуары', offer:'Сумки из натуральной кожи', price:11200, oldPrice:null, image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=250&fit=crop', tag:'Топ' },
  { id:'b5', brand:'Gate31', category:'Джинсы', offer:'Деним прямого кроя −15%', price:5780, oldPrice:6800, image:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=250&fit=crop', tag:'Скидка' },
  { id:'b6', brand:'Present & Simple', category:'Футболки', offer:'Базовые оттенки — новые цвета', price:2400, oldPrice:null, image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=250&fit=crop', tag:'Новинка' },
]

const OFFER_CATEGORIES = ['Все', 'Верхняя одежда', 'Трикотаж', 'Платья', 'Аксессуары', 'Джинсы', 'Футболки']

export default function ProfileClient() {
  const params = useSearchParams()
  const sellerId = params.get('seller') || 'demo'
  const [tab, setTab] = useState<'data' | 'offers' | 'orders'>('data')
  const [offerCat, setOfferCat] = useState('Все')
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [wishlist, setWishlist] = useState<unknown[]>([])

  useEffect(() => {
    const p = localStorage.getItem('user_profile')
    if (p) setProfile(JSON.parse(p))
    // загружаем заказы из Supabase
    const loadOrders = async () => {
      try {
        const orderIds = JSON.parse(localStorage.getItem('order_ids') || '[]')
        const phone = localStorage.getItem('buyer_phone') || ''
        let data: any[] = []
        if (phone) {
          const { data: byPhone } = await supabase.from('orders').select('*').eq('buyer_phone', phone).order('created_at', { ascending: false })
          if (byPhone?.length) data = byPhone
        }
        if (!data.length && orderIds.length) {
          const { data: byIds } = await supabase.from('orders').select('*').in('id', orderIds).order('created_at', { ascending: false })
          if (byIds?.length) data = byIds
        }
        if (data.length) setOrders(data)
        else {
          const local = JSON.parse(localStorage.getItem('orders') || '[]')
          setOrders([...local].reverse())
        }
      } catch {
        const local = JSON.parse(localStorage.getItem('orders') || '[]')
        setOrders([...local].reverse())
      }
    }
    loadOrders()
    const w = localStorage.getItem('wishlist')
    if (w) setWishlist(JSON.parse(w))
  }, [])

  const vibes = (profile?.vibes as string[]) || (profile?.stylePrefs as string[]) || []
  const sizes = profile?.sizes as Record<string, string> | undefined
  const photo = typeof window !== 'undefined' ? localStorage.getItem('user_photo_base64') : null

  const filteredOffers = offerCat === 'Все' ? BRAND_OFFERS : BRAND_OFFERS.filter(o => o.category === offerCat)

  const handleNav = (id: string) => {
    const routes: Record<string, string> = {
      stylist: `/stylist?seller=${sellerId}`,
      catalog: `/shop?seller=${sellerId}`,
      cart: `/shop/cart?seller=${sellerId}`,
      profile: `/profile?seller=${sellerId}`,
    }
    if (routes[id]) window.location.href = routes[id]
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.accent}`, flexShrink: 0, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {photo
              ? <img src={`data:image/jpeg;base64,${photo}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 28 }}>👤</span>
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Мой профиль</p>
            <p style={{ fontSize: 12, color: C.muted }}>AIMEE Member</p>
            {vibes.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {vibes.slice(0, 3).map((v, i) => (
                  <span key={i} style={{ fontSize: 10, color: C.accent, background: C.accentDim, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{v}</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => {
            localStorage.removeItem('stylist_seen')
            localStorage.removeItem('user_profile')
            localStorage.removeItem('user_photo_base64')
            window.location.href = `/stylist?seller=${sellerId}`
          }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 11, color: C.muted, fontWeight: 600 }}>
            ⚙️ Изменить
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Заказов', value: orders.length },
            { label: 'Избранное', value: wishlist.length },
            { label: 'Вайбов', value: vibes.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{s.value}</p>
              <p style={{ fontSize: 10, color: C.muted }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {([
            { id: 'data', label: 'Мои данные' },
            { id: 'offers', label: 'От брендов' },
            { id: 'orders', label: 'Заказы' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '9px 4px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: tab === t.id ? C.accent : C.card,
              color: tab === t.id ? C.bg : C.muted,
              border: `1px solid ${tab === t.id ? C.accent : C.border}`,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Tab: Мои данные ── */}
      {tab === 'data' && (
        <div style={{ padding: '0 20px' }}>
          {/* Security badge */}
          <div style={{ background: 'rgba(63,185,80,0.08)', border: `1px solid ${C.ok}30`, borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.ok }}>Данные защищены</p>
              <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Зашифрованы E2E. Принадлежат только вам. Никогда не продаются.</p>
            </div>
          </div>

          {/* Sizes */}
          {sizes && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 12, letterSpacing: 1 }}>📏 МОИ РАЗМЕРЫ</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Верх', value: sizes.tops },
                  { label: 'Низ', value: sizes.bottoms },
                  { label: 'Джинсы', value: sizes.jeans },
                  { label: 'Рост', value: `${profile?.height}см` },
                  { label: 'Вес', value: `${profile?.weight}кг` },
                  { label: 'Тип', value: profile?.bodyType as string || '—' },
                ].map(s => s.value && (
                  <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{s.value}</p>
                    <p style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vibes */}
          {vibes.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 1 }}>✦ МОЙ ВАЙБ</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {vibes.map((v, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, color: C.accent, background: C.accentDim, border: `1px solid ${C.accent}30`, padding: '5px 12px', borderRadius: 99 }}>{v}</span>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist */}
          {wishlist.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.pink, marginBottom: 10, letterSpacing: 1 }}>❤️ ИЗБРАННОЕ</p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {(wishlist as Array<{images?: string[]}>).map((item, i) => (
                  <div key={i} style={{ flexShrink: 0, width: 70, height: 80, borderRadius: 10, overflow: 'hidden', background: C.surface }}>
                    {item.images?.[0] && <img src={item.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI analytics */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 1 }}>🤖 AI-АНАЛИТИКА</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Стиль', value: vibes[0] || 'Не определён' },
                { label: 'Предпочтения', value: vibes.slice(0, 3).join(', ') || 'Пройдите онбординг' },
                { label: 'Подборки', value: 'Обновляются каждый день' },
                { label: 'Примерки', value: 'История сохранена' },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 12, color: C.muted }}>{a.label}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delete data */}
          <button style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'none', border: `1px solid ${C.border}`, color: C.dim, fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
            Удалить все мои данные
          </button>
        </div>
      )}

      {/* ── Tab: От брендов ── */}
      {tab === 'offers' && (
        <div style={{ padding: '0 20px' }}>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>
            Персональные предложения от брендов — на основе вашего вайба и размеров
          </p>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
            {OFFER_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setOfferCat(cat)} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: offerCat === cat ? C.accent : C.card,
                color: offerCat === cat ? C.bg : C.muted,
                border: `1px solid ${offerCat === cat ? C.accent : C.border}`,
              }}>{cat}</button>
            ))}
          </div>

          {/* Offers grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filteredOffers.map(offer => (
              <div key={offer.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => window.location.href = `/shop?seller=${sellerId}&brand=${offer.brand}`}>
                <div style={{ position: 'relative' }}>
                  <img src={offer.image} alt={offer.brand} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: C.accent, color: C.bg, fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
                    {offer.tag}
                  </div>
                </div>
                <div style={{ padding: '10px 10px 12px' }}>
                  <p style={{ fontSize: 10, color: C.accent, fontWeight: 700, marginBottom: 2 }}>{offer.brand}</p>
                  <p style={{ fontSize: 11, color: C.text, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{offer.offer}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{offer.price.toLocaleString('ru')} ₽</p>
                    {offer.oldPrice && <p style={{ fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>{offer.oldPrice.toLocaleString('ru')}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Заказы ── */}
      {tab === 'orders' && (
        <div style={{ padding: '0 20px' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📦</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Заказов пока нет</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Перейдите в каталог и сделайте первый заказ</p>
              <button onClick={() => window.location.href = `/shop?seller=${sellerId}`}
                style={{ padding: '12px 28px', borderRadius: 12, background: C.accent, color: C.bg, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                В каталог →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(orders as any[]).map(order => (
                <div key={order.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: C.muted }}>#{order.id.slice(-6).toUpperCase()}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.ok, background: C.okDim, padding: '2px 8px', borderRadius: 99 }}>
                      {order.status === 'pending' ? 'Обрабатывается' : order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    {(order.items as any[])?.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} style={{ width: 44, height: 50, borderRadius: 8, overflow: 'hidden', background: C.surface, flexShrink: 0 }}>
                        {(item as any).product?.images?.[0] && <img src={(item as any).product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 13, color: C.muted }}>{new Date(order.created_at).toLocaleDateString('ru')}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{(order.total_price || order.total)?.toLocaleString('ru')} ₽</p>
                      <button onClick={() => window.location.href='/shop/orders'} style={{ fontSize:11, color:C.accent, background:C.accentDim, border:'none', borderRadius:8, padding:'4px 10px', cursor:'pointer', fontWeight:600 }}>Следить →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav active="profile" onTab={handleNav} />
    </div>
  )
}
