'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { C } from '@/lib/config'
import OnboardingFlow, { UserProfile } from '@/components/OnboardingFlow'
import TryOnButton from '@/components/TryOnButton'
import { trackActivity } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

interface Product {
  id: string; name: string; price: number; images: string[]
  category: string; sizes: string[]; canNegotiate?: boolean; brand?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: Product[]
  timestamp: string
}

const QUICK_REPLIES = [
  '🌅 На каждый день',
  '🎉 На вечеринку',
  '💼 В офис',
  '🎭 В театр',
  '🏖 В отпуск',
  '🤷 Просто смотрю',
]

// ─── Welcome Screen ────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100vh', background:C.bg,
      alignItems:'center', justifyContent:'center', padding:'0 32px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom:32, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{
          width:80, height:80, borderRadius:24,
          background:`linear-gradient(135deg,${C.accent},#00B4A0)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:36, fontWeight:900, color:C.bg,
          boxShadow:`0 0 40px ${C.accentGlow}`,
        }}>A</div>
        <p style={{ fontSize:28, fontWeight:800, letterSpacing:4, color:C.text }}>AIMEE</p>
        <p style={{ fontSize:13, color:C.muted, textAlign:'center', lineHeight:1.5 }}>
          Персональный AI-стилист<br/>знает весь гардероб магазина
        </p>
      </div>

      {/* Features */}
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:10, marginBottom:40 }}>
        {[
          { icon:'✦', text:'Подберёт образ под любой случай' },
          { icon:'💬', text:'Договорится о лучшей цене за вас' },
          { icon:'👗', text:'Запомнит ваш гардероб' },
        ].map(f => (
          <div key={f.icon} style={{
            display:'flex', alignItems:'center', gap:12,
            background:C.card, border:`1px solid ${C.border}`,
            borderRadius:14, padding:'12px 16px',
          }}>
            <span style={{ fontSize:20, color:C.accent }}>{f.icon}</span>
            <span style={{ fontSize:14, color:C.text, fontWeight:500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        width:'100%', padding:18, borderRadius:16, fontSize:16, fontWeight:800,
        background:C.accent, color:C.bg, border:'none', cursor:'pointer',
        boxShadow:`0 4px 24px ${C.accentGlow}`,
      }}>
        Начать →
      </button>

      <p style={{ fontSize:11, color:C.dim, marginTop:16 }}>Бесплатно · Без регистрации</p>
    </div>
  )
}

// ─── Bottom Sheet for product ──────────────────────────────────
function ProductSheet({ product, onClose, onAddToCart, onViewFull }: {
  product: Product
  onClose: () => void
  onAddToCart: (p: Product, size: string) => void
  onViewFull: () => void
}) {
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [showNeg, setShowNeg] = useState(false)
  const [negotiatedPrice, setNegotiatedPrice] = useState<number|null>(null)
  const [negMessages, setNegMessages] = useState<{role:string;content:string}[]>([])
  const [negInput, setNegInput] = useState('')
  const [negLoading, setNegLoading] = useState(false)

  useEffect(() => {
    // Proactive A2A — if canNegotiate, agent proactively offers after 2s
    if (product.canNegotiate) {
      setTimeout(() => {
        setShowNeg(true)
        setNegMessages([{
          role:'seller_ai',
          content:`Вижу вас интересует "${product.name}" 👋 Специально для вас готов предложить скидку — напишите желаемую цену или "предложи сам" 😊`
        }])
      }, 2000)
    }
  }, [product])

  const handleAdd = () => {
    if (!selectedSize) return
    onAddToCart({ ...product, price: negotiatedPrice || product.price }, selectedSize)
    setAdded(true)
  }

  const handleNegSend = async () => {
    if (!negInput.trim()) return
    const msg = negInput.trim(); setNegInput('')
    const newMsgs = [...negMessages, { role:'buyer', content:msg }]
    setNegMessages(newMsgs); setNegLoading(true)
    try {
      const res = await fetch('/api/negotiations', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ product, messages: newMsgs, buyerMessage: msg }),
      })
      const data = await res.json()
      setNegMessages(prev => [...prev, { role:'seller_ai', content: data.reply }])
      if (data.agreedPrice) setNegotiatedPrice(data.agreedPrice)
    } catch { setNegMessages(prev => [...prev, { role:'seller_ai', content:'Назовите желаемую цену 😊' }]) }
    finally { setNegLoading(false) }
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100 }} />
      {/* Sheet */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:101,
        background:C.surface, borderRadius:'20px 20px 0 0',
        maxHeight:'85vh', overflowY:'auto',
        paddingBottom:'env(safe-area-inset-bottom)',
        animation:'slideUp 0.25s ease',
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:4 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.border }} />
        </div>

        {/* Product */}
        <div style={{ display:'flex', gap:14, padding:'10px 16px 14px' }}>
          <div style={{ width:90, height:110, borderRadius:12, overflow:'hidden', flexShrink:0, background:C.card }}>
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>👗</div>
            }
          </div>
          <div style={{ flex:1 }}>
            <span style={{ fontSize:9, fontWeight:600, color:C.accent, background:C.accentDim, padding:'2px 7px', borderRadius:99, display:'inline-block', marginBottom:6 }}>{product.category}</span>
            <p style={{ fontSize:14, fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:6 }}>{product.name}</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {negotiatedPrice
                ? <><p style={{ fontSize:12, color:C.muted, textDecoration:'line-through' }}>{product.price.toLocaleString('ru')} ₽</p><p style={{ fontSize:18, fontWeight:800, color:C.ok }}>{negotiatedPrice.toLocaleString('ru')} ₽</p></>
                : <p style={{ fontSize:18, fontWeight:800, color:C.text }}>{product.price.toLocaleString('ru')} ₽</p>
              }
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div style={{ padding:'0 16px 14px' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.accent, marginBottom:8 }}>Размер</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {product.sizes.map(s => (
              <button key={s} onClick={() => setSelectedSize(s)} style={{
                padding:'6px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer',
                background: selectedSize===s ? C.accent : C.card,
                color: selectedSize===s ? C.bg : C.muted,
                border: `1px solid ${selectedSize===s ? C.accent : C.border}`,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* A2A Chat — proactive */}
        {showNeg && !negotiatedPrice && (
          <div style={{ margin:'0 16px 14px', background:C.card, border:`1px solid ${C.orange}30`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'8px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:C.bg }}>A</div>
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:C.orange }}>💬 Агент предлагает скидку</p>
              </div>
            </div>
            <div style={{ padding:'8px 12px', maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {negMessages.map((m,i) => (
                <div key={i} style={{ display:'flex', justifyContent: m.role==='buyer' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'85%', padding:'7px 11px', borderRadius: m.role==='buyer' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize:12, color:C.text, background: m.role==='buyer' ? C.userBub : C.surface }}>{m.content}</div>
                </div>
              ))}
              {negLoading && <div style={{ display:'flex', gap:3, padding:'8px 12px', background:C.surface, borderRadius:12, width:'fit-content' }}>{[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:C.muted }} />)}</div>}
            </div>
            <div style={{ display:'flex', gap:6, padding:'8px 10px', borderTop:`1px solid ${C.border}` }}>
              <input value={negInput} onChange={e => setNegInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleNegSend()}
                placeholder="Хочу за 3000 ₽..."
                style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', fontSize:12, color:C.text, outline:'none' }}
              />
              <button onClick={handleNegSend} disabled={!negInput.trim()} style={{ background:C.accent, color:C.bg, border:'none', borderRadius:8, padding:'7px 12px', fontWeight:700, fontSize:13, cursor:'pointer', opacity: negInput.trim() ? 1 : 0.4 }}>→</button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding:'0 16px 16px', display:'flex', gap:8 }}>
          <button onClick={handleAdd} disabled={!selectedSize || added} style={{
            flex:1, padding:14, borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer',
            background: added ? C.ok : selectedSize ? C.accent : C.card,
            color: added || selectedSize ? C.bg : C.muted,
            border: `1px solid ${added ? C.ok : selectedSize ? C.accent : C.border}`,
            opacity: !selectedSize && !added ? 0.5 : 1,
          }}>
            {added ? '✓ В корзине' : selectedSize ? 'В корзину →' : 'Выберите размер'}
          </button>
          <button onClick={onViewFull} style={{ padding:'14px 16px', borderRadius:14, background:C.card, border:`1px solid ${C.border}`, color:C.muted, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' as const }}>
            Подробнее
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Product mini-card in chat ─────────────────────────────────
function ProductMiniCard({ product, onTap, onWishlist, wishlisted }: {
  product: Product; onTap: () => void; onWishlist: () => void; wishlisted: boolean
}) {
  return (
    <button onClick={onTap} style={{
      background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
      overflow:'hidden', textAlign:'left', cursor:'pointer', padding:0, position:'relative',
      width:130, flexShrink:0,
    }}>
      <div style={{ width:'100%', aspectRatio:'3/4', background:C.surface, position:'relative' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>👗</div>
        }
        {/* Wishlist */}
        <button onClick={e => { e.stopPropagation(); onWishlist() }} style={{
          position:'absolute', top:6, right:6, width:28, height:28, borderRadius:'50%',
          background:'rgba(13,17,23,0.7)', border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
        }}>
          {wishlisted ? '❤️' : '🤍'}
        </button>
        {product.canNegotiate && (
          <div style={{ position:'absolute', bottom:6, left:6, background:'rgba(255,166,87,0.9)', borderRadius:99, padding:'1px 6px', fontSize:8, fontWeight:700, color:'#111' }}>💬 A2A</div>
        )}
      </div>
      <div style={{ padding:'8px 8px 10px' }}>
        <p style={{ fontSize:11, fontWeight:600, color:C.text, lineHeight:1.3, marginBottom:3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{product.name}</p>
        <p style={{ fontSize:13, fontWeight:800, color:C.text }}>{product.price.toLocaleString('ru')} ₽</p>
      </div>
    </button>
  )
}

// ─── Main Stylist Component ────────────────────────────────────
export default function StylistClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sellerId = params.get('seller') || (typeof window !== 'undefined' ? localStorage.getItem('seller_id') : '') || 'demo'
  const buyerPhone = typeof window !== 'undefined' ? localStorage.getItem('buyer_phone') || '' : ''

  const [showWelcome, setShowWelcome] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wardrobe, setWardrobe] = useState<{id:string;name:string;category:string}[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [activeProduct, setActiveProduct] = useState<Product|null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length)
    setWardrobe(JSON.parse(localStorage.getItem('wardrobe') || '[]'))
    setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'))
    const seen = localStorage.getItem('stylist_seen')
    const hasPhoto = localStorage.getItem('user_photo_base64')
    const savedProfile = localStorage.getItem('user_profile')
    if (seen) {
      // User already went through onboarding - skip welcome screen
      if (savedProfile) {
        try { const profile = JSON.parse(savedProfile); if (profile) setUserProfile(profile) } catch {}
      }
      setShowWelcome(false)
    }
  }, [])

  // Start conversation when welcome is dismissed (both new and returning users)
  useEffect(() => {
    if (!showWelcome && messages.length === 0) {
      const savedProfile = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user_profile') || 'null')
        : null
      sendMessage('', true, savedProfile)
    }
  }, [showWelcome])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem('stylist_seen', '1')
    localStorage.setItem('user_profile', JSON.stringify(profile))
    setUserProfile(profile)
    setMessages([]) // reset so stylist starts fresh with new vibes
    setShowWelcome(false)
    // useEffect on showWelcome will trigger sendMessage
  }

  const sendMessage = async (text: string, isInit = false, profile?: UserProfile) => {
    if (!text.trim() && !isInit) return
    setLoading(true)
    const userMsg: Message = { role:'user', content:text, timestamp: new Date().toISOString() }
    const newMessages = isInit ? [] : [...messages, userMsg]
    if (!isInit) setMessages(newMessages)
    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
    const activeProfile = profile || userProfile
    try {
      const res = await fetch('/api/stylist', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: apiMessages, wardrobe, sellerId, userProfile: activeProfile }),
      })
      const data = await res.json()
      const assistantMsg: Message = { role:'assistant', content: data.reply, products: data.products, timestamp: new Date().toISOString() }
      setMessages(prev => isInit ? [assistantMsg] : [...prev, assistantMsg])
      if (data.products?.length > 0) {
        await trackActivity(sellerId, buyerPhone, 'view', { source:'stylist', product_ids: data.products.map((p: Product) => p.id), query: text })
      }
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Привет! Под какой случай ищем сегодня?', timestamp: new Date().toISOString() }])
    } finally { setLoading(false) }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input; setInput('')
    await sendMessage(text)
  }

  const handleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId) ? wishlist.filter(id => id !== productId) : [...wishlist, productId]
    setWishlist(updated)
    localStorage.setItem('wishlist', JSON.stringify(updated))
  }

  const handleAddToCart = (product: Product, size: string) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product, size, quantity:1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartCount(cart.length)
    const w = JSON.parse(localStorage.getItem('wardrobe') || '[]')
    if (!w.find((x: {id:string}) => x.id === product.id)) {
      w.push({ id: product.id, name: product.name, category: product.category })
      localStorage.setItem('wardrobe', JSON.stringify(w))
    }
    trackActivity(sellerId, buyerPhone, 'add_to_cart', { product_id: product.id, product_name: product.name, size, price: product.price, source:'stylist' })
    setActiveProduct(null)
  }

  const handleTab = (id: string) => {
    if (id === 'catalog') router.push('/shop?seller=' + sellerId)
    if (id === 'cart') router.push('/shop/cart?seller=' + sellerId)
    if (id === 'profile') router.push('/profile?seller=' + sellerId)
  }

  if (showWelcome) return <OnboardingFlow onComplete={handleOnboardingComplete} />

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'12px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:C.bg }}>A</div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:C.text, lineHeight:1 }}>AI-Стилист</p>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:C.ok }} />
                <span style={{ fontSize:10, color:C.ok }}>онлайн</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {userProfile?.photoAnalysis && userProfile?.sizes && (
              <div style={{ padding:'4px 10px', borderRadius:99, background:C.card, border:`1px solid ${C.border}`, fontSize:11, fontWeight:600, color:C.muted }}>
                📏 {userProfile.sizes.tops} / {userProfile.sizes.jeans}
              </div>
            )}
            {wishlist.length > 0 && (
              <div style={{ padding:'4px 10px', borderRadius:99, background:C.pinkDim, border:`1px solid ${C.pink}30`, fontSize:11, fontWeight:600, color:C.pink }}>❤️ {wishlist.length}</div>
            )}
            {wardrobe.length > 0 && (
              <div style={{ padding:'4px 10px', borderRadius:99, background:C.accentDim, border:`1px solid ${C.accent}30`, fontSize:11, fontWeight:600, color:C.accent }}>👗 {wardrobe.length}</div>
            )}
            <button onClick={() => {
              localStorage.removeItem('stylist_seen')
              localStorage.removeItem('user_profile')
              localStorage.removeItem('user_photo_base64')
              window.location.reload()
            }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:C.dim, padding:4 }} title="Обновить профиль">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 8px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom:12 }}>
            {msg.role === 'assistant' ? (
              <div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom: msg.products?.length ? 10 : 0 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:C.bg, flexShrink:0 }}>A</div>
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px 14px 14px 2px', padding:'10px 14px', maxWidth:'85%' }}>
                    <p style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{msg.content}</p>
                  </div>
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div style={{ marginLeft:36 }}>
                    <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
                      {msg.products.map(p => (
                        <ProductMiniCard key={p.id} product={p}
                          onTap={() => setActiveProduct(p)}
                          onWishlist={() => handleWishlist(p.id)}
                          wishlisted={wishlist.includes(p.id)}
                        />
                      ))}
                    </div>
                    <TryOnButton
                      outfit={{ title: msg.content.split('.')[0] || 'Образ от стилиста', products: msg.products, discount: 15 }}
                      onAddAllToCart={(products, discount) => {
                        products.forEach(p => {
                          const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                          const profile = JSON.parse(localStorage.getItem('user_profile') || 'null')
                          const cat = p.category.toLowerCase()
                          let size = p.sizes[0]
                          if (profile?.sizes) {
                            if (['платья','блузки','рубашки','трикотаж','футболки'].some(c => cat.includes(c)) && p.sizes.includes(profile.sizes.tops)) size = profile.sizes.tops
                            else if (['джинсы','брюки'].some(c => cat.includes(c)) && p.sizes.includes(profile.sizes.jeans)) size = profile.sizes.jeans
                            else if (['юбки'].some(c => cat.includes(c)) && p.sizes.includes(profile.sizes.bottoms)) size = profile.sizes.bottoms
                          }
                          const discountedPrice = Math.round(p.price * (1 - discount / 100))
                          cart.push({ product: { ...p, price: discountedPrice }, size, quantity: 1 })
                          localStorage.setItem('cart', JSON.stringify(cart))
                        })
                        setCartCount(JSON.parse(localStorage.getItem('cart') || '[]').length)
                        trackActivity(sellerId, buyerPhone, 'order', { source: 'outfit', products: products.map(p => p.id), discount })
                      }}
                      onViewProduct={(p) => setActiveProduct(p)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <div style={{ background:C.userBub, borderRadius:'14px 14px 2px 14px', padding:'10px 14px', maxWidth:'75%' }}>
                  <p style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:C.bg }}>A</div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px 14px 14px 2px', padding:'12px 16px', display:'flex', gap:4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:C.muted, animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 1 && !loading && (
        <div style={{ padding:'0 14px 8px', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {QUICK_REPLIES.map(r => (
              <button key={r} onClick={() => { setInput(r); sendMessage(r) }} style={{
                flexShrink:0, padding:'7px 14px', borderRadius:99, fontSize:13, fontWeight:500,
                background:C.card, border:`1px solid ${C.border}`, color:C.text, cursor:'pointer',
              }}>{r}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input — fixed above bottom nav, respects safe area */}
      <div style={{
        flexShrink:0, padding:'10px 14px',
        borderTop:`1px solid ${C.border}`,
        paddingBottom:'calc(10px + 64px + env(safe-area-inset-bottom))',
        background:C.bg,
      }}>
        <div style={{ display:'flex', gap:8 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSend()}
            placeholder="Спросите стилиста..."
            style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:'12px 14px', fontSize:14, color:C.text, outline:'none' }}
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} style={{
            background:C.accent, color:C.bg, border:'none', borderRadius:12,
            padding:'12px 18px', fontWeight:700, fontSize:16, cursor:'pointer',
            opacity: !input.trim() || loading ? 0.4 : 1,
          }}>→</button>
        </div>
      </div>

      <BottomNav active="stylist" onTab={handleTab} cartCount={cartCount} />

      {/* Bottom sheet */}
      {activeProduct && (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAddToCart={handleAddToCart}
          onViewFull={() => { router.push('/shop/'+activeProduct.id+'?seller='+sellerId); setActiveProduct(null) }}
        />
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
    </div>
  )
}
