'use client'

import { useState, useRef, useEffect } from 'react'
import { C } from '@/lib/config'
import { calculateSizes } from '@/lib/size-calculator'

interface Props { onComplete: (profile: UserProfile) => void }

export interface UserProfile {
  height: number; weight: number; bodyType: string
  stylePrefs: string[]; vibes: string[]
  sizes: ReturnType<typeof calculateSizes>
  photoAnalysis?: { chest:number; waist:number; hips:number; confidence:number; notes:string }
}

type AnalysisResult = { topSize:string; bottomSize:string; jeansSize:string; bodyType:string; chest:number; waist:number; hips:number; confidence:number; notes:string }

const VIBES = [
  { id:'luxury',     label:'Тихая роскошь',   color:'#C4A882' },
  { id:'paris',      label:'Парижский шик',    color:'#E6CCB2' },
  { id:'street',     label:'Уличный стиль',    color:'#FF6B9D' },
  { id:'office',     label:'Офис без скуки',   color:'#00E5C7' },
  { id:'party',      label:'Вечеринка',        color:'#FFA657' },
  { id:'nature',     label:'#cottagecore',     color:'#3FB950' },
  { id:'sport',      label:'Спорт-шик',        color:'#7DD3FC' },
  { id:'romantic',   label:'Романтика',        color:'#F0ABFC' },
  { id:'classic',    label:'Классика',         color:'#E6EDF3' },
  { id:'dark',       label:'Тёмная эстетика',  color:'#9D4EDD' },
  { id:'boho',       label:'Бохо',             color:'#D4A853' },
  { id:'bold',       label:'Яркие принты',     color:'#EF4444' },
  { id:'cozy',       label:'Уютный стиль',     color:'#A78BFA' },
  { id:'minimal',    label:'Минимализм',       color:'#94A3B8' },
  { id:'editorial',  label:'Editorial',        color:'#E879F9' },
  { id:'casual',     label:'Casual everyday',  color:'#60A5FA' },
  { id:'vintage',    label:'Винтаж',           color:'#F59E0B' },
  { id:'glam',       label:'Гламур',           color:'#FFD700' },
]

// ── Act 1: Welcome ───────────────────────────────────────────
function WelcomeAct({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [line, setLine] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setLine(1), 700)
    const t2 = setTimeout(() => setLine(2), 1500)
    const t3 = setTimeout(() => setLine(3), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden', position:'relative' }}>

      {/* Background glow */}
      <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle, rgba(0,229,199,0.12) 0%, transparent 70%)`, pointerEvents:'none' }} />

      {/* Logo block */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:56, flexShrink:0 }}>
        <div style={{ width:84, height:84, borderRadius:24, background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, fontWeight:900, color:C.bg, boxShadow:`0 0 56px ${C.accentGlow}`, marginBottom:12, animation:'glow 2.5s ease infinite' }}>A</div>
        <p style={{ fontSize:28, fontWeight:900, letterSpacing:6, color:C.text }}>AIMEE</p>
      </div>

      {/* Main copy */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 24px', gap:14 }}>

        {/* Hero */}
        <div style={{ opacity: line > 0 ? 1 : 0, transform: line > 0 ? 'translateY(0)' : 'translateY(16px)', transition:'all 0.6s ease', textAlign:'center', marginBottom:6 }}>
          <p style={{ fontSize:27, fontWeight:900, color:C.text, lineHeight:1.25 }}>
            Шоппинг,{' '}
            <span style={{ color:C.accent }}>который тебя понимает</span>
          </p>
        </div>

        {/* Cards */}
        {[
          {
            icon:'✦',
            title:'Сотни брендов. Один вайб. Твой.',
            sub:'AI подбирает образы под твою личность — без лишнего шума',
            accent: true,
          },
          {
            icon:'🔐',
            title:'Твоя личность — только твоя.',
            sub:'Никакого слива данных и навязанной рекламы.',
            accent: false,
          },
        ].map((card, i) => (
          <div key={i} style={{
            opacity: line > i + 1 ? 1 : 0,
            transform: line > i + 1 ? 'translateY(0)' : 'translateY(12px)',
            transition:`all 0.5s ease ${i * 0.1}s`,
            background: C.card,
            border: `1px solid ${card.accent ? C.accent + '35' : C.border}`,
            borderRadius:16,
            padding:'14px 16px',
            display:'flex',
            gap:12,
            alignItems:'flex-start',
          }}>
            <div style={{ width:36, height:36, borderRadius:10, background: card.accent ? C.accentDim : C.surface, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:3, lineHeight:1.3 }}>{card.title}</p>
              <p style={{ fontSize:11, color:C.muted, lineHeight:1.45 }}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding:'16px 24px 44px', flexShrink:0, display:'flex', flexDirection:'column', gap:10, opacity: line >= 3 ? 1 : 0, transform: line >= 3 ? 'translateY(0)' : 'translateY(10px)', transition:'all 0.5s ease' }}>
        <button onClick={onNext} style={{ width:'100%', padding:18, borderRadius:16, fontSize:17, fontWeight:800, background:`linear-gradient(135deg,${C.accent},#00C4AC)`, color:C.bg, border:'none', cursor:'pointer', boxShadow:`0 6px 36px ${C.accentGlow}`, letterSpacing:0.3 }}>
          Создать мой профиль →
        </button>
        <button onClick={onSkip} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:C.dim, padding:'6px', letterSpacing:0.2 }}>
          Войти без регистрации
        </button>
      </div>

      <style>{`@keyframes glow { 0%,100%{box-shadow:0 0 56px ${C.accentGlow}} 50%{box-shadow:0 0 80px rgba(0,229,199,0.35)} }`}</style>
    </div>
  )
}

// ── Act 2: Body params ───────────────────────────────────────
function BodyAct({ onNext }: { onNext: (d: { height:number; weight:number; photoBase64?:string; analysis?:AnalysisResult }) => void }) {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [photo, setPhoto] = useState<string|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult|null>(null)
  const [showTip, setShowTip] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const compress = (dataUrl: string): Promise<string> => new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      let w = img.width, h = img.height, max = 1200
      if (w > max || h > max) { if (w > h) { h = Math.round(h*max/w); w = max } else { w = Math.round(w*max/h); h = max } }
      c.width = w; c.height = h
      c.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = dataUrl
  })

  const analyze = async (b64: string, h: string, w: string) => {
    if (!h || !w || parseInt(h) < 100 || parseInt(w) < 30) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-body', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ photoBase64: b64, height: parseInt(h), weight: parseInt(w) }) })
      const data = await res.json()
      if (data.success) setAnalysis(data)
    } catch {}
    finally { setAnalyzing(false) }
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compress(ev.target?.result as string)
      setPreview(compressed)
      const b64 = compressed.split(',')[1]
      setPhoto(b64)
      localStorage.setItem('user_photo_base64', b64)
      if (height && weight) analyze(b64, height, weight)
    }
    reader.readAsDataURL(file)
  }

  const canNext = height.length >= 2 && weight.length >= 2

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg }}>
      <div style={{ flex:1, overflowY:'auto', padding:'24px 20px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ display:'flex', gap:4 }}>
            <div style={{ width:20, height:4, borderRadius:2, background:C.accent }} />
            <div style={{ width:20, height:4, borderRadius:2, background:C.border }} />
          </div>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.accent }}>ШАГ 1 ИЗ 2</p>
        </div>
        <p style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:4 }}>Параметры тела</p>
        <p style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.5 }}>Подберём точный размер — никаких возвратов</p>

        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          {[
            { label:'РОСТ', value:height, setValue:(v:string)=>{ setHeight(v); if (photo && v.length >= 2 && weight.length >= 2) analyze(photo, v, weight) }, ph:'170', unit:'см' },
            { label:'ВЕС',  value:weight, setValue:(v:string)=>{ setWeight(v); if (photo && v.length >= 2 && height.length >= 2) analyze(photo, height, v) }, ph:'60',  unit:'кг' },
          ].map(f => (
            <div key={f.label} style={{ flex:1 }}>
              <p style={{ fontSize:10, fontWeight:600, color:C.muted, marginBottom:6, letterSpacing:1 }}>{f.label}</p>
              <div style={{ position:'relative' }}>
                <input type="number" inputMode="numeric" placeholder={f.ph} value={f.value} onChange={e => f.setValue(e.target.value)}
                  style={{ width:'100%', background:C.card, border:`1px solid ${f.value ? C.accent : C.border}`, borderRadius:12, padding:'14px', fontSize:24, fontWeight:700, color:C.text, outline:'none', textAlign:'center', boxSizing:'border-box' as const }}
                />
                <span style={{ position:'absolute', right:10, bottom:14, fontSize:12, color:C.muted, fontWeight:600 }}>{f.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:16 }}>
          <p style={{ fontSize:10, fontWeight:600, color:C.muted, marginBottom:6, letterSpacing:1 }}>
            ФОТО В ПОЛНЫЙ РОСТ <span style={{ color:C.orange }}>— точнее определит размер</span>
          </p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
          {!preview ? (
            <div>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.text, marginBottom:10 }}>Как встать для точного результата:</p>
                <div style={{ display:'flex', gap:12 }}>
                  <svg width="44" height="90" viewBox="0 0 48 100" fill="none"><circle cx="24" cy="10" r="8" fill={C.accent} opacity="0.9"/><rect x="16" y="20" width="16" height="30" rx="4" fill={C.accent} opacity="0.7"/><rect x="6" y="22" width="8" height="22" rx="4" fill={C.accent} opacity="0.5"/><rect x="34" y="22" width="8" height="22" rx="4" fill={C.accent} opacity="0.5"/><rect x="16" y="52" width="7" height="34" rx="4" fill={C.accent} opacity="0.6"/><rect x="25" y="52" width="7" height="34" rx="4" fill={C.accent} opacity="0.6"/></svg>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                    {['Встаньте ровно, руки вдоль тела','Всё тело в кадре — голова до ног','Хорошее освещение, без лишнего'].map((s,i) => (
                      <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:C.accentDim, border:`1px solid ${C.accent}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:9, fontWeight:800, color:C.accent }}>{i+1}</span>
                        </div>
                        <p style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => fileRef.current?.click()} style={{ width:'100%', padding:'16px', borderRadius:14, background:C.card, border:`2px dashed ${C.border}`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:28 }}>📸</span>
                <p style={{ fontSize:13, fontWeight:600, color:C.text }}>Выбрать фото из галереи</p>
                <p style={{ fontSize:11, color:C.muted }}>или сфотографироваться</p>
              </button>
            </div>
          ) : (
            <div style={{ position:'relative', borderRadius:14, overflow:'hidden', background:C.card, border:`1px solid ${C.border}` }}>
              <img src={preview} alt="preview" style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }} />
              <div style={{ position:'absolute', inset:0, background:'rgba(13,17,23,0.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                {analyzing ? (
                  <><div style={{ width:32, height:32, border:`2px solid ${C.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /><p style={{ fontSize:12, color:C.accent, fontWeight:600 }}>Анализирую силуэт...</p></>
                ) : analysis ? (
                  <div style={{ padding:'12px 16px', background:'rgba(0,229,199,0.15)', borderRadius:12, border:`1px solid ${C.accent}40`, textAlign:'center', maxWidth:'85%' }}>
                    <p style={{ fontSize:18, fontWeight:900, color:C.accent }}>✓ Проанализировано</p>
                    <p style={{ fontSize:11, color:C.text, marginTop:4, lineHeight:1.4 }}>{analysis.notes}</p>
                  </div>
                ) : (
                  <button onClick={() => photo && analyze(photo, height, weight)} disabled={!canNext} style={{ padding:'10px 20px', borderRadius:10, background:C.accent, color:C.bg, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', opacity: canNext ? 1 : 0.5 }}>
                    Анализировать →
                  </button>
                )}
              </div>
              <button onClick={() => { setPhoto(null); setPreview(null); setAnalysis(null) }} style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:'50%', background:'rgba(13,17,23,0.8)', border:'none', cursor:'pointer', color:C.text, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          )}
        </div>

        {analysis && (
          <div style={{ background:C.accentDim, border:`1px solid ${C.accent}30`, borderRadius:14, padding:'14px 16px', marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <p style={{ fontSize:10, fontWeight:700, color:C.accent, letterSpacing:1 }}>✦ РАЗМЕР ПО ФОТО</p>
              <div style={{ position:'relative', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:10, color:C.muted }}>рекомендация AI</span>
                <button onClick={() => setShowTip(!showTip)} style={{ width:16, height:16, borderRadius:'50%', background:C.card, border:`1px solid ${C.border}`, cursor:'pointer', fontSize:9, color:C.muted, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>?</button>
                {showTip && (
                  <div style={{ position:'absolute', top:22, right:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', width:200, zIndex:10, boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
                    <p style={{ fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:8 }}>AIMEE старается, но AI не идеален — сверьтесь с размерной сеткой бренда перед заказом.</p>
                    <button onClick={() => { setShowTip(false); setPhoto(null); setPreview(null); setAnalysis(null) }} style={{ fontSize:11, fontWeight:700, color:C.accent, background:'none', border:'none', cursor:'pointer', padding:0 }}>Переснять →</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display:'flex', gap:14, marginBottom:8, flexWrap:'wrap' }}>
              {[{ label:'Верх', v: analysis.topSize }, { label:'Низ', v: analysis.bottomSize }, { label:'Джинсы', v: analysis.jeansSize }, { label:'Грудь', v: `${analysis.chest}см` }, { label:'Талия', v: `${analysis.waist}см` }].map(s => (
                <div key={s.label} style={{ textAlign:'center' }}>
                  <p style={{ fontSize:20, fontWeight:900, color:C.text }}>{s.v}</p>
                  <p style={{ fontSize:9, color:C.muted }}>{s.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:10, color:C.dim, lineHeight:1.4, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              ✨ AIMEE старается, но AI не идеален — сверьтесь с размерной сеткой бренда перед заказом.
            </p>
          </div>
        )}
      </div>

      <div style={{ padding:'12px 20px 32px', borderTop:`1px solid ${C.border}`, background:C.bg, flexShrink:0 }}>
        <button onClick={() => onNext({ height: parseInt(height), weight: parseInt(weight), photoBase64: photo || undefined, analysis: analysis || undefined })}
          disabled={!canNext}
          style={{ width:'100%', padding:16, borderRadius:14, fontSize:15, fontWeight:700, background: canNext ? C.accent : C.card, color: canNext ? C.bg : C.muted, border:`1px solid ${canNext ? C.accent : C.border}`, cursor: canNext ? 'pointer' : 'default', transition:'all 0.2s' }}>
          Далее — выбрать вайб →
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Act 3: Vibe Bubbles ──────────────────────────────────────
function VibeAct({ onNext }: { onNext: (vibes: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  // Generate stable positions
  const [positions] = useState(() => VIBES.map((_, i) => ({
    left: `${8 + (i % 3) * 30 + (i % 7) * 3}%`,
    top: `${6 + Math.floor(i / 3) * 17 + (i % 5) * 2}%`,
    size: 58 + (i % 4) * 12,
  })))

  const toggle = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, overflow:'hidden' }}>
      <div style={{ padding:'20px 20px 10px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ display:'flex', gap:4 }}>
            <div style={{ width:20, height:4, borderRadius:2, background:C.accent }} />
            <div style={{ width:20, height:4, borderRadius:2, background:C.accent }} />
          </div>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:C.accent }}>ШАГ 2 ИЗ 2</p>
        </div>
        <p style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:3 }}>Твой вайб ✦</p>
        <p style={{ fontSize:13, color:C.muted }}>Тапай всё что откликается — стилист поймёт твой психотип</p>
      </div>

      {/* Bubble field */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {VIBES.map((b, i) => {
          const sel = selected.includes(b.id)
          const pos = positions[i]
          const delay = (i * 0.37) % 2.5
          const duration = 2.8 + (i % 5) * 0.6
          const floatAnim = `float${i % 4}`
          return (
            // Outer wrapper handles float animation
            <div key={b.id} style={{
              position:'absolute',
              left: pos.left,
              top: pos.top,
              width: pos.size,
              height: pos.size,
              animation: `${floatAnim} ${duration}s ${delay}s ease-in-out infinite`,
              zIndex: sel ? 2 : 1,
            }}>
              <button onClick={() => toggle(b.id)} style={{
                width:'100%',
                height:'100%',
                borderRadius:'50%',
                border: `2px solid ${sel ? b.color : b.color + '55'}`,
                background: sel ? b.color + '28' : 'rgba(22,27,34,0.85)',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                padding:6,
                backdropFilter:'blur(8px)',
                transform: sel ? 'scale(1.15)' : 'scale(1)',
                transition:'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s, border-color 0.25s, background 0.25s',
                boxShadow: sel ? `0 0 24px ${b.color}55, 0 0 48px ${b.color}22` : 'none',
              }}>
                <span style={{ fontSize: pos.size < 68 ? 9 : 11, fontWeight:700, color: sel ? b.color : '#6E7681', textAlign:'center', lineHeight:1.2, transition:'color 0.2s', pointerEvents:'none' }}>
                  {b.label}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom */}
      <div style={{ padding:'10px 20px 32px', borderTop:`1px solid ${C.border}`, background:C.bg, flexShrink:0 }}>
        {selected.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {selected.map(id => {
              const b = VIBES.find(v => v.id === id)
              if (!b) return null
              return <span key={id} style={{ fontSize:11, fontWeight:600, color:b.color, background:b.color+'18', border:`1px solid ${b.color}40`, padding:'3px 10px', borderRadius:99 }}>{b.label}</span>
            })}
          </div>
        )}
        <button onClick={() => selected.length >= 2 && onNext(selected)} disabled={selected.length < 2}
          style={{ width:'100%', padding:16, borderRadius:14, fontSize:15, fontWeight:800, cursor: selected.length >= 2 ? 'pointer' : 'default', transition:'all 0.3s', background: selected.length >= 2 ? C.accent : C.card, color: selected.length >= 2 ? C.bg : C.muted, border:`1px solid ${selected.length >= 2 ? C.accent : C.border}`, boxShadow: selected.length >= 2 ? `0 4px 28px ${C.accentGlow}` : 'none' }}>
          {selected.length < 2 ? `Выберите ещё ${2 - selected.length}` : 'Магия стилиста ✦'}
        </button>
      </div>

      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 40%{transform:translateY(-15px)} 80%{transform:translateY(-5px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 30%{transform:translateY(-8px)} 70%{transform:translateY(-13px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0px)} 60%{transform:translateY(-18px)} }
      `}</style>
    </div>
  )
}

// ── Act 4: Magic loading ─────────────────────────────────────
function MagicAct({ vibes, onDone }: { vibes: string[]; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const msgs = ['Изучаю ваш стиль...', 'Анализирую предпочтения...', 'Подбираю образы...', 'Формирую подборки...', 'Почти готово ✨']

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= msgs.length - 1) { clearInterval(interval); setTimeout(onDone, 900); return prev }
        return prev + 1
      })
    }, 550)
    return () => clearInterval(interval)
  }, [])

  const selVibes = vibes.map(id => VIBES.find(v => v.id === id)).filter(Boolean) as typeof VIBES

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:C.bg, alignItems:'center', justifyContent:'center', padding:'0 32px' }}>
      {/* Animated orb */}
      <div style={{ position:'relative', marginBottom:36, width:120, height:120 }}>
        <div style={{ position:'absolute', inset:-8, borderRadius:'50%', border:`2px solid ${C.accent}44`, animation:'orbit 3s linear infinite' }} />
        <div style={{ position:'absolute', inset:-16, borderRadius:'50%', border:`1px solid ${C.pink}33`, animation:'orbit 5s linear infinite reverse' }} />
        <div style={{ width:120, height:120, borderRadius:'50%', background:`linear-gradient(135deg,${C.accent},#00B4A0)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 60px ${C.accentGlow}` }}>
          <span style={{ fontSize:50, color:C.bg }}>✦</span>
        </div>
      </div>

      <p style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6, textAlign:'center', minHeight:30 }}>{msgs[step]}</p>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:32 }}>
        {selVibes.map(v => (
          <span key={v.id} style={{ fontSize:12, fontWeight:600, color:v.color, background:v.color+'20', border:`1px solid ${v.color}40`, padding:'4px 12px', borderRadius:99 }}>{v.label}</span>
        ))}
      </div>

      <div style={{ width:'100%', height:3, background:C.border, borderRadius:2 }}>
        <div style={{ height:'100%', background:C.accent, borderRadius:2, width:`${((step+1)/msgs.length)*100}%`, transition:'width 0.5s ease', boxShadow:`0 0 8px ${C.accent}` }} />
      </div>

      <style>{`
        @keyframes orbit { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function OnboardingFlow({ onComplete }: Props) {
  const [act, setAct] = useState(0)
  const [bodyData, setBodyData] = useState<{ height:number; weight:number; photoBase64?:string; analysis?:AnalysisResult }|null>(null)
  const [vibes, setVibes] = useState<string[]>([])

  const handleSkip = () => {
    // Skip onboarding — go straight with defaults
    const baseSizes = calculateSizes({ height: 170, weight: 65, bodyType: '' as never })
    onComplete({ height: 170, weight: 65, bodyType: '', stylePrefs: [], vibes: [], sizes: baseSizes })
  }

  const handleMagicDone = () => {
    const h = bodyData?.height || 170
    const w = bodyData?.weight || 65
    const baseSizes = calculateSizes({ height: h, weight: w, bodyType: bodyData?.analysis?.bodyType as never })
    const finalSizes = bodyData?.analysis ? { ...baseSizes, tops: bodyData.analysis.topSize, bottoms: bodyData.analysis.bottomSize, jeans: bodyData.analysis.jeansSize, description: bodyData.analysis.notes } : baseSizes
    if (bodyData?.photoBase64) localStorage.setItem('user_photo_base64', bodyData.photoBase64)
    onComplete({ height: h, weight: w, bodyType: bodyData?.analysis?.bodyType || '', stylePrefs: vibes, vibes, sizes: finalSizes, photoAnalysis: bodyData?.analysis ? { chest: bodyData.analysis.chest, waist: bodyData.analysis.waist, hips: bodyData.analysis.hips, confidence: bodyData.analysis.confidence, notes: bodyData.analysis.notes } : undefined })
  }

  if (act === 0) return <WelcomeAct onNext={() => setAct(1)} onSkip={handleSkip} />
  if (act === 1) return <BodyAct onNext={d => { setBodyData(d); setAct(2) }} />
  if (act === 2) return <VibeAct onNext={v => { setVibes(v); setAct(3) }} />
  if (act === 3) return <MagicAct vibes={vibes} onDone={handleMagicDone} />
  return null
}
