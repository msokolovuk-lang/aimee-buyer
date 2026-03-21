import { NextRequest, NextResponse } from 'next/server'
import { DEMO_PRODUCTS } from '@/lib/config'

export async function POST(req: NextRequest) {
  const { messages, wardrobe = [], sellerId = 'demo', userProfile = null } = await req.json()
  const products = DEMO_PRODUCTS.filter(p => p.seller_id === sellerId || sellerId === 'demo')

  const sizeInfo = userProfile?.sizes
    ? `Размеры: верх ${userProfile.sizes.tops}, низ ${userProfile.sizes.bottoms}, джинсы ${userProfile.sizes.jeans}`
    : 'Размер неизвестен'

  const styleInfo = userProfile?.stylePrefs?.length
    ? `Вайб и стиль: ${userProfile.stylePrefs.join(', ')}`
    : ''

  const bodyInfo = userProfile?.height
    ? `Параметры: ${userProfile.height}см / ${userProfile.weight}кг, тип фигуры: ${userProfile.bodyType || 'не указан'}`
    : ''

  const systemPrompt = `Ты — AIMEE, персональный AI-стилист. Коротко и визуально.

Профиль:
${sizeInfo}
${bodyInfo}
${styleInfo}
Гардероб: ${wardrobe.length > 0 ? wardrobe.map((w: {name:string}) => w.name).join(', ') : 'пуст'}

Товары:
${products.map(p => `ID:${p.id} | ${p.name} | ${p.category} | ${p.price}₽${p.canNegotiate ? ' | 💬торг' : ''}`).join('\n')}

Правила:
- Максимум 2 предложения, без воды
- Всегда давай [PRODUCTS: id1,id2,id3] — 2-4 товара
- Учитывай стиль и тип фигуры при подборе
- Если у товара есть торг — скажи "можно получить лучшую цену"
- Первый ответ: поздоровайся по имени вайба ("Вижу ты ценишь [вайб]!"), скажи что подобрал образы и сразу предложи [PRODUCTS: ...] — 3-4 товара под первый вайб из списка`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.length > 0 ? messages : [{ role: 'user', content: 'Привет!' }],
      }),
    })
    const data = await res.json()
    const reply = data.content?.[0]?.text || 'Привет! Под какой случай ищем?'
    const match = reply.match(/\[PRODUCTS:\s*([^\]]+)\]/)
    const productIds = match ? match[1].split(',').map((s: string) => s.trim()) : []
    const suggestedProducts = products.filter(p => productIds.includes(p.id))
    const cleanReply = reply.replace(/\[PRODUCTS:[^\]]+\]/, '').trim()
    return NextResponse.json({ reply: cleanReply, products: suggestedProducts })
  } catch {
    return NextResponse.json({ reply: 'Привет! Под какой случай ищем сегодня?', products: [] })
  }
}
