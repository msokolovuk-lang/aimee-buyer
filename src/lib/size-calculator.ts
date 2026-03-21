// ─── Size calculator from body params ─────────────────────────

export interface BodyParams {
  height: number  // cm
  weight: number  // kg
  chest?: number  // cm
  waist?: number  // cm
  hips?: number   // cm
  bodyType?: 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted'
  stylePrefs?: string[]
}

export interface SizeRecommendation {
  tops: string      // XS/S/M/L/XL
  bottoms: string   // XS/S/M/L/XL or 25/26/27/28...
  jeans: string     // waist size
  shoes?: string
  bmi: number
  description: string
}

// BMI-based size estimation (simplified, works without chest/waist)
export function calculateSizes(params: BodyParams): SizeRecommendation {
  const { height, weight } = params
  const bmi = weight / ((height / 100) ** 2)

  // Estimate chest/waist from height+weight if not provided
  const estimatedChest = params.chest || Math.round(height * 0.53 + weight * 0.15)
  const estimatedWaist = params.waist || Math.round(height * 0.37 + weight * 0.18)

  // Tops size
  let tops = 'M'
  if (estimatedChest <= 80) tops = 'XS'
  else if (estimatedChest <= 86) tops = 'S'
  else if (estimatedChest <= 92) tops = 'M'
  else if (estimatedChest <= 98) tops = 'L'
  else if (estimatedChest <= 104) tops = 'XL'
  else tops = 'XXL'

  // Bottoms (jeans waist)
  let jeans = '27'
  let bottoms = 'M'
  if (estimatedWaist <= 64) { jeans = '25'; bottoms = 'XS' }
  else if (estimatedWaist <= 68) { jeans = '26'; bottoms = 'S' }
  else if (estimatedWaist <= 72) { jeans = '27'; bottoms = 'M' }
  else if (estimatedWaist <= 76) { jeans = '28'; bottoms = 'M' }
  else if (estimatedWaist <= 80) { jeans = '29'; bottoms = 'L' }
  else if (estimatedWaist <= 84) { jeans = '30'; bottoms = 'L' }
  else if (estimatedWaist <= 88) { jeans = '31'; bottoms = 'XL' }
  else { jeans = '32'; bottoms = 'XXL' }

  const description = `Ваш размер верха — ${tops}, низа — ${bottoms} (джинсы ${jeans}). Подобрано по параметрам ${height}см / ${weight}кг.`

  return { tops, bottoms, jeans, bmi: Math.round(bmi * 10) / 10, description }
}

// Get recommended size for a specific category
export function getSizeForCategory(category: string, sizes: SizeRecommendation): string | null {
  const cat = category.toLowerCase()
  if (['платья','блузки','рубашки','трикотаж','футболки','куртки','пальто'].some(c => cat.includes(c))) {
    return sizes.tops
  }
  if (['джинсы','брюки'].some(c => cat.includes(c))) {
    return sizes.jeans
  }
  if (['юбки'].some(c => cat.includes(c))) {
    return sizes.bottoms
  }
  return null
}
