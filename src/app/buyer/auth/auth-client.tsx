'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = {
  bg:'#0D1117', surface:'#161B22', card:'#1C2333', border:'#2A3444',
  text:'#E6EDF3', muted:'#8B949E', accent:'#00E5C7',
}

export default function AuthClient() {
  const router = useRouter()
  const params = useSearchParams()
  const sellerId = params.get('seller') || 'demo'
  const [step, setStep] = useState<'phone'|'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g,'')
    if (d.startsWith('7') || d.startsWith('8')) return '+7' + d.slice(1,11)
    if (d.startsWith('9')) return '+7' + d.slice(0,10)
    return '+' + d.slice(0,12)
  }

  const handleSend = async () => {
    setLoading(true)
    const formatted = formatPhone(phone)
    try { await supabase.auth.signInWithOtp({ phone: formatted }); setPhone(formatted); setStep('otp') }
    catch { localStorage.setItem('buyer_phone', formatted); localStorage.setItem('seller_id', sellerId); router.push('/shop?seller='+sellerId) }
    finally { setLoading(false) }
  }

  const handleVerify = async () => {
    setLoading(true)
    try { await supabase.auth.verifyOtp({ phone, token:otp, type:'sms' }) }
    catch {}
    localStorage.setItem('buyer_phone', phone); localStorage.setItem('seller_id', sellerId)
    router.push('/shop?seller='+sellerId)
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:C.bg, padding:'0 16px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', paddingTop:64, paddingBottom:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:40, height:40, borderRadius:8, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, color:C.bg }}>A</div>
          <span style={{ fontSize:24, fontWeight:800, letterSpacing:3, color:C.text }}>AIMEE</span>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:24 }}>
          {step === 'phone' ? (
            <>
              <p style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>Войти в магазин</p>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Введите номер телефона</p>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.accent, marginBottom:8 }}>Номер телефона</p>
              <input type="tel" inputMode="numeric" placeholder="+7 999 000 00 00" value={phone} onChange={e=>setPhone(e.target.value)}
                style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px', fontSize:18, color:C.text, outline:'none', marginBottom:16, boxSizing:'border-box' as const }}
              />
              <button onClick={handleSend} disabled={loading || phone.length < 10}
                style={{ width:'100%', background:C.accent, color:C.bg, border:'none', borderRadius:12, padding:'14px', fontSize:15, fontWeight:700, cursor:'pointer', opacity: loading || phone.length < 10 ? 0.4 : 1 }}>
                {loading ? 'Отправляем...' : 'Получить код →'}
              </button>
              <p style={{ fontSize:11, color:C.muted, textAlign:'center', marginTop:12 }}>Отправим SMS с кодом подтверждения</p>
            </>
          ) : (
            <>
              <p style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>Код из SMS</p>
              <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Отправили на {phone}</p>
              <input type="number" inputMode="numeric" placeholder="000000" value={otp} onChange={e=>setOtp(e.target.value)}
                style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px', fontSize:32, fontWeight:700, color:C.text, textAlign:'center', letterSpacing:'0.4em', outline:'none', marginBottom:16, boxSizing:'border-box' as const }}
              />
              <button onClick={handleVerify} disabled={loading || otp.length < 4}
                style={{ width:'100%', background:C.accent, color:C.bg, border:'none', borderRadius:12, padding:'14px', fontSize:15, fontWeight:700, cursor:'pointer', opacity: loading || otp.length < 4 ? 0.4 : 1, marginBottom:8 }}>
                {loading ? 'Проверяем...' : 'Войти →'}
              </button>
              <button onClick={()=>setStep('phone')} style={{ width:'100%', background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', padding:'8px' }}>← Изменить номер</button>
            </>
          )}
        </div>
      </div>

      <p style={{ fontSize:11, color:C.muted, textAlign:'center', paddingBottom:40, opacity:0.4 }}>AI-маркетплейс для брендов одежды</p>
    </div>
  )
}
