import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { photoBase64, mediaType = 'image/jpeg', height, weight } = await req.json()

  const prompt = `You are a professional body measurement AI. Analyze this full-body photo with height ${height}cm and weight ${weight}kg.

Estimate measurements and respond ONLY in this exact JSON (no other text):
{
  "chest": 88,
  "waist": 70,
  "hips": 94,
  "bodyType": "hourglass",
  "topSize": "M",
  "bottomSize": "M",
  "jeansSize": "27",
  "confidence": 0.75,
  "notes": "Короткая заметка о силуэте на русском, 1 предложение"
}

bodyType options: hourglass / pear / apple / rectangle / inverted_triangle
sizes: XS/S/M/L/XL/XXL for top/bottom, 24-36 for jeans`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: photoBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })
    const data = await res.json()
    const text = data.content?.[0]?.text || '{}'
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ success: true, ...result })
  } catch {
    // Fallback: calculate from height/weight
    const w = weight, h = height
    const chest = Math.round(h * 0.53 + w * 0.15)
    const waist = Math.round(h * 0.37 + w * 0.18)
    const hips = Math.round(waist * 1.12)
    let topSize = 'M', bottomSize = 'M', jeansSize = '27'
    if (chest <= 80) topSize = 'XS'
    else if (chest <= 86) topSize = 'S'
    else if (chest <= 92) topSize = 'M'
    else if (chest <= 98) topSize = 'L'
    else topSize = 'XL'
    if (waist <= 64) { jeansSize = '25'; bottomSize = 'XS' }
    else if (waist <= 68) { jeansSize = '26'; bottomSize = 'S' }
    else if (waist <= 72) { jeansSize = '27'; bottomSize = 'M' }
    else if (waist <= 76) { jeansSize = '28'; bottomSize = 'M' }
    else if (waist <= 80) { jeansSize = '29'; bottomSize = 'L' }
    else { jeansSize = '30'; bottomSize = 'L' }
    return NextResponse.json({ success: true, chest, waist, hips, bodyType: 'rectangle', topSize, bottomSize, jeansSize, confidence: 0.6, notes: 'Размер рассчитан по росту и весу', fallback: true })
  }
}
