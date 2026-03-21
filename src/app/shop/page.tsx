import { Suspense } from 'react'
import CatalogClient from './shop-client'
export default function ShopPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><CatalogClient /></Suspense>
}
