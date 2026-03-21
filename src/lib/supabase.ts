import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})

// Track buyer activity — всё что делает покупатель пишется сюда
// Seller MVP читает это через realtime подписку
export async function trackActivity(
  sellerId: string,
  buyerPhone: string,
  action: 'view' | 'add_to_cart' | 'remove_from_cart' | 'order' | 'return' | 'negotiate' | 'negotiate_accept' | 'negotiate_reject',
  payload: Record<string, unknown>
) {
  await supabase.from('buyer_activity').insert({
    seller_id: sellerId,
    buyer_phone: buyerPhone,
    type: action,
    data: payload,
    created_at: new Date().toISOString(),
  })
}
