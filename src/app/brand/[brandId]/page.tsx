import { Suspense } from 'react'
import BrandClient from './brand-client'
export default function BrandPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><BrandClient /></Suspense>
}
