'use client'
import { C, TABS } from '@/lib/config'

interface Props {
  active: string
  onTab: (id: string) => void
  cartCount?: number
}

export default function BottomNav({ active, onTab, cartCount = 0 }: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: C.bg, borderTop: `1px solid ${C.border}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 0',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    }}>
      {TABS.map(t => {
        const isActive = active === t.id
        const isCart = t.id === 'cart'
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 16px', position: 'relative',
            opacity: isActive ? 1 : 0.45,
          }}>
            <span style={{ fontSize: 20, color: isActive ? C.accent : C.muted, lineHeight: 1 }}>
              {t.icon}
            </span>
            {isCart && cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 8,
                background: C.accent, color: C.bg,
                fontSize: 9, fontWeight: 800,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 400,
              color: isActive ? C.accent : C.muted,
            }}>{t.label}</span>
            {isActive && (
              <div style={{ width: 20, height: 2, borderRadius: 1, background: C.accent, marginTop: 1 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
