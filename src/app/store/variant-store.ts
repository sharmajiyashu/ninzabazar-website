import { create } from 'zustand'
import { ProductVariant } from '../types/type'

interface VariantState {
  variants: ProductVariant[]
  selectedVariants: { [productId: string]: { [title: string]: string } }
  saveVariant: (variants: ProductVariant[]) => void
  setSelectedVariant: (productId: string, title: string, option: string) => void
  getSelectedVariants: (productId: string) => { [title: string]: string }
  getSelectedVariantId: (
    productId: string,
    allVariants: ProductVariant[]
  ) => string | undefined
  areAllVariantsSelected: (
    productId: string,
    groupedVariants: { title: string; variants: ProductVariant[] }[]
  ) => boolean
  clearProductSelections: (productId: string) => void
}

const useVariantStore = create<VariantState>()((set, get) => ({
  variants: [],
  selectedVariants: {},

  saveVariant: (variants: ProductVariant[]) => set({ variants }),

  setSelectedVariant: (productId: string, title: string, option: string) =>
    set((state) => ({
      selectedVariants: {
        ...state.selectedVariants,
        [productId]: {
          ...state.selectedVariants[productId],
          [title]: option,
        },
      },
    })),

  getSelectedVariants: (productId: string) => {
    return get().selectedVariants[productId] || {}
  },

  getSelectedVariantId: (productId: string, allVariants: ProductVariant[]) => {
    const selectedOptions = get().selectedVariants[productId]
    if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
      return undefined
    }

    // Find variant that matches all selected options
    const matchingVariant = allVariants.find((variant) => {
      // Check if this variant matches all selected options for its product
      return selectedOptions[variant.title] === variant.option
    })

    return matchingVariant?.id
  },

  areAllVariantsSelected: (
    productId: string,
    groupedVariants: { title: string; variants: ProductVariant[] }[]
  ) => {
    const selectedOptions = get().selectedVariants[productId] || {}
    return groupedVariants.every((group) => !!selectedOptions[group.title])
  },

  clearProductSelections: (productId: string) =>
    set((state) => {
      const newSelectedVariants = { ...state.selectedVariants }
      delete newSelectedVariants[productId]
      return { selectedVariants: newSelectedVariants }
    }),
}))

export default useVariantStore
