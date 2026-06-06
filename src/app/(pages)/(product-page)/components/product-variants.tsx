import React, { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { ProductVariant } from '@/app/types/type'
import useVariantStore from '@/app/store/variant-store'
type VariantsProps = {
  selectedVariants: { [title: string]: string }
  setSelectedVariants: React.Dispatch<
    React.SetStateAction<{ [title: string]: string }>
  >
}

const Variants: React.FC<VariantsProps> = ({
  selectedVariants,
  setSelectedVariants,
}) => {
  const params = useParams()
  const id = params.id

  const variantStore = useVariantStore()

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log('Making API request for product ID:', id)

      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
  })
  const groupedVariants = useMemo(() => {
    if (!product?.variants) return {}

    return (product.variants as ProductVariant[]).reduce(
      (acc: Record<string, ProductVariant[]>, variant) => {
        const { title } = variant
        if (!acc[title]) {
          acc[title] = []
        }
        acc[title].push(variant)
        return acc
      },
      {} as Record<string, ProductVariant[]>
    )
  }, [product?.variants])

  const setVariant = (variant: ProductVariant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variant.title]: variant.id,
    }))
    console.log(variant)
    console.log('Updated selections:', {
      ...selectedVariants,
      [variant.title]: variant.id,
    })
  }

  // Check if variant is selected for its title group
  const isVariantSelected = (variantId: string, title: string) => {
    return selectedVariants[title] === variantId
  }

  useEffect(() => {
    const allSelected = Object.keys(groupedVariants).every(
      (title) => selectedVariants[title]
    )
    if (allSelected) {
      const SelectedVariantsObject = Object.entries(selectedVariants)
        .map(([title, variantId]) =>
          groupedVariants[title].find((v) => v.id === variantId)
        )
        .filter(Boolean) as ProductVariant[]
      variantStore.saveVariant(SelectedVariantsObject)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariants, groupedVariants])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col flex-wrap gap-2 pt-4">
        {Object.entries(groupedVariants).map(
          ([title, variants]: [string, ProductVariant[]], index: number) => (
            <div key={(variants && variants[0]?.id) || index}>
              <h3>{title}</h3>
              <div>
                {variants.map((variant: ProductVariant) => (
                  <Button
                    key={variant.id}
                    className={`mx-1 bg-white text-green border border-green hover:bg-green hover:text-white ${isVariantSelected(variant.id, title) ? 'bg-green text-white' : ''}`}
                    onClick={() => setVariant(variant)}
                  >
                    {variant.option}
                  </Button>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default Variants
