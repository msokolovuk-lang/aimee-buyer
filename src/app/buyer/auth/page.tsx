import { Suspense } from 'react'
import AuthClient from './auth-client'
export default function AuthPage() {
  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#0D1117'}} />}><AuthClient /></Suspense>
}
