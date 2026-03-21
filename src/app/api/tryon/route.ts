import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { personPhotoBase64, garmentImageUrl, category = 'tops' } = await req.json()

  const apiKey = process.env.FASHN_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'FASHN_API_KEY not configured' }, { status: 500 })
  if (!personPhotoBase64 || personPhotoBase64.length < 1000) {
    return NextResponse.json({ error: 'Фото не загружено. Пройдите онбординг и загрузите фото в полный рост.' }, { status: 400 })
  }

  const fashnCategory = category === 'lower_body' ? 'bottoms'
    : category === 'dresses' ? 'one-pieces'
    : 'tops'

  try {
    // Clean base64 — remove spaces/newlines that corrupt the image
    const cleanBase64 = personPhotoBase64.replace(/\s/g, '')
    const imageBytes = Buffer.from(cleanBase64, 'base64')

    // Upload to Supabase Storage
    const filename = `tryon/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('tryon-photos')
      .upload(filename, imageBytes, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

    const { data: urlData } = supabase.storage.from('tryon-photos').getPublicUrl(filename)
    const modelImageUrl = urlData.publicUrl

    const res = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image: modelImageUrl,
          garment_image: garmentImageUrl,
          category: fashnCategory,
          mode: 'performance',
        },
      }),
    })

    const data = await res.json()
    if (!res.ok || !data.id) throw new Error(JSON.stringify(data))

    return NextResponse.json({ predictionId: data.id, success: true })
  } catch (err: unknown) {
    console.error('FASHN error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err), success: false }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const predictionId = req.nextUrl.searchParams.get('id')
  if (!predictionId) return NextResponse.json({ error: 'No ID' }, { status: 400 })

  const apiKey = process.env.FASHN_API_KEY
  try {
    const res = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    const data = await res.json()
    const errorMsg = data.error?.message || data.error || null
    return NextResponse.json({
      status: data.status,
      imageUrl: data.status === 'completed' ? data.output?.[0] : null,
      error: errorMsg,
    })
  } catch {
    return NextResponse.json({ error: 'Poll failed', status: 'failed' }, { status: 500 })
  }
}
