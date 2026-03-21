import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { product, messages, buyerMessage } = await req.json()

  const discount = 0.15 // max 15% discount seller allows
  const minPrice = Math.round(product.price * (1 - discount))

  const systemPrompt = `Ты — AI-агент продавца на маркетплейсе AIMEE. Ты ведёшь переговоры о цене товара от имени бренда.

Товар: ${product.name}
Оригинальная цена: ${product.price} ₽
Минимальная цена (не разглашай): ${minPrice} ₽

Правила:
- Будь дружелюбным, но защищай интересы продавца
- Можешь давать скидку максимум 15%
- Если покупатель просит меньше минимума — мягко откажи и предложи минимум
- Если покупатель согласен на цену >= минимума — подтверди сделку
- При подтверждении сделки обязательно добавь в конце: [AGREED_PRICE: XXXXX] где XXXXX — согласованная цена в рублях (только число)
- Отвечай коротко, по-русски, 1-2 предложения`

  const history = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'buyer' ? 'user' : 'assistant',
    content: m.content,
  }))

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: buyerMessage }],
      }),
    })

    const data = await res.json()
    const reply = data.content?.[0]?.text || 'Рассмотрим ваше предложение.'

    // Extract agreed price if present
    const match = reply.match(/\[AGREED_PRICE:\s*(\d+)\]/)
    const agreedPrice = match ? parseInt(match[1]) : null
    const cleanReply = reply.replace(/\[AGREED_PRICE:\s*\d+\]/, '').trim()

    return NextResponse.json({ reply: cleanReply, agreedPrice })
  } catch {
    return NextResponse.json({ reply: 'Готов рассмотреть ваше предложение. Какую цену вы хотите?', agreedPrice: null })
  }
}
