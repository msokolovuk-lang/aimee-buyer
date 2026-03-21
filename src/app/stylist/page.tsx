import { Suspense } from 'react'
import StylistClient from './stylist-client'
export default function StylistPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><StylistClient /></Suspense>
}
