import { Suspense } from 'react'
import OrdersClient from './orders-client'
export default function OrdersPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><OrdersClient /></Suspense>
}
