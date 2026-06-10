import { CartItem } from '@/app/types/type'

export const COLOR_VARIANT_PREFIX = 'color:'

export function getCartItemKey(item: CartItem): string {
  if (item.id) return item.id
  const variants = (item.variantCombination || []).slice().sort().join('|')
  return `${item.productId}:${variants || 'default'}`
}

export function buildVariantCombination(
  selectedVariants: Record<string, string>,
  colorId?: string | null
): string[] {
  const ids = Object.values(selectedVariants).filter(Boolean)
  if (colorId) ids.push(`${COLOR_VARIANT_PREFIX}${colorId}`)
  return ids
}

export function getVariantTitles(variants?: { title: string }[]): string[] {
  if (!variants?.length) return []
  return [...new Set(variants.map((v) => v.title))]
}

export function formatVariantCombinationLabel(
  variantCombination: string[],
  variants?: { id: string; title: string; option: string }[],
  colors?: { id: string; name: string }[]
): string {
  return variantCombination
    .map((id) => {
      if (id.startsWith(COLOR_VARIANT_PREFIX)) {
        const colorId = id.slice(COLOR_VARIANT_PREFIX.length)
        const color = colors?.find((c) => c.id === colorId)
        return color ? `Color: ${color.name}` : null
      }
      const match = variants?.find((v) => v.id === id)
      return match ? `${match.title}: ${match.option}` : null
    })
    .filter(Boolean)
    .join(', ')
}

export function getCartItemUnitPrice(item: {
  basePrice: number
  salePrice?: number | null
  isSale?: boolean
  variants?: { id: string; price?: number | string; hasPrice?: boolean }[]
  variantCombination?: string[]
}): number {
  let price =
    item.isSale && item.salePrice ? Number(item.salePrice) : Number(item.basePrice)

  if (item.variantCombination?.length && item.variants?.length) {
    const variantExtra = item.variantCombination
      .filter((id) => !id.startsWith(COLOR_VARIANT_PREFIX))
      .reduce((sum, id) => {
        const v = item.variants!.find((variant) => variant.id === id)
        if (v?.hasPrice && v.price) return sum + Number(v.price)
        return sum
      }, 0)
    if (variantExtra > 0) price += variantExtra
  }

  return price
}
