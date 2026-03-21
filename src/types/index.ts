export interface Product {
  id: string
  seller_id: string
  name: string
  description: string
  price: number
  images: string[]
  sizes: string[]
  category: string
  in_stock: boolean
  sku?: string
}

export interface CartItem {
  product: Product
  size: string
  quantity: number
}

export interface OrderItem {
  name: string
  price: number
  size: string
  quantity: number
}

export interface Order {
  id: string
  buyer_phone: string
  buyer_name?: string
  buyer_address?: string
  seller_id: string
  items: OrderItem[]
  total?: number
  total_price?: number
  status: 'new' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'return_requested' | 'returned'
  is_ai_buyer?: boolean
  negotiated_price?: number
  created_at: string
}

export interface NegotiationMessage {
  role: 'buyer' | 'seller_ai'
  content: string
  timestamp: string
}

export interface BuyerSession {
  phone: string
  seller_id: string
  cart: CartItem[]
}
