import { Suspense } from 'react'
import ProductClient from './product-client'
export default function ProductPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><ProductClient /></Suspense>
}
