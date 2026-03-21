import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { seller_id, buyer_name, buyer_phone, buyer_address, items, total_price, is_ai_buyer } = body

    const { data, error } = await supabase.from('orders').insert({
      seller_id, buyer_name, buyer_phone, buyer_address,
      items, total_price, is_ai_buyer: is_ai_buyer || false, status: 'new'
    }).select().single()

    if (error) throw error

    // track activity
    await supabase.from('buyer_activity').insert({
      seller_id,
      buyer_phone,
      type: 'order_placed',
      data: { order_id: data.id, total: total_price, items: items.map((i: any) => ({ name: i.product?.name || i.name, price: i.product?.price || i.price })), is_ai_buyer: is_ai_buyer || false }
    }).select()

    return NextResponse.json({ order_id: data.id, status: 'success' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
