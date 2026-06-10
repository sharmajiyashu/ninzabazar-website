export interface UserProps {
  id: string
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  profilePicture: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
  sellerProfile?: {
    id: string
    userId: string
    companyName: string
    description: string
    createdAt: string
    updatedAt: string
    isVerified: boolean
    businessDocumentFile?: string
    businessDocumentType?: string
    businessEmail?: string
    businessPhoneNumber?: string
    businessRegisteredName?: string
    businessType?: string
    individualRegisteredName?: string
    shopName?: string
    returnsTerms?: string
    shippingTerms?: string
    sellerEmail?: string
    sellerPhoneNumber?: string
    registeredAddress?: Address
    pickupAddress?: PickupAddress
    storeRatingSummary?: {
      id: string
      sellerId: string
      average: number
      totalCount: number
    }
    reviews: Array<{
      id: string
      rating: number
    }>
    products: Array<{
      id: string
      name: string
      images: Array<{
        urlpath: string
        isDefault: boolean
      }>
      basePrice: number
      isSale: boolean
      salePrice?: number
      reviews: Array<{ rating: number }>
    }>
    businessEntities?: BusinessEntityData[]
  }
  buyerProfile?: {
    id: string
    userId: string
    createdAt: string
    updatedAt: string
    shippingAddresses: Array<{
      id: string
      street: string
      city: string
      state: string
      postalCode: string
      country: string
      isDefault: boolean
      label?: string
    }>
  }
}

export interface SellerProfileProps {
  id: string
  userId: string
  companyName: string
  createdAt: string
  updatedAt: string
  isVerified: boolean
  businessDocumentFile?: string | null
  businessDocumentType?: string | null
  businessEmail?: string | null
  businessPhoneNumber?: string | null
  businessRegisteredName?: string | null
  businessType?: string | null
  individualRegisteredName?: string | null
  shopName?: string | null
  returnsTerms?: string | null
  sellerEmail?: string | null
  sellerPhoneNumber?: string | null
  shippingTerms?: string | null
  description?: string | null
  registeredAddress?: Address | null
  pickupAddress?: PickupAddress | null
  storeRatingSummary?: {
    id: string
    sellerId: string
    average: number
    totalCount: number
    updatedAt: string
  }

  CartItem: CartItem[]
  OrderItem: OrderItem[]
  products: ProductDataProps[]

  reviews?: Array<{
    id: string
    rating: number
  }>
  businessEntities?: BusinessEntityData[]

  user: UserProps
}

export interface Address {
  id: string
  sellerId: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: string
  updatedAt: string
}

export interface PickupAddress {
  id: string
  sellerId: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  createdAt: string
  updatedAt: string
}

export interface DealsCardProps {
  title: string
  description: string
  image: string
  altImage: string
  bgColor: string
}
export interface DealsDataProps {
  id: number
  title: string
  description: string
  image: string
  altImage: string
  bgColor: string
}

export interface ProductCardProps {
  id: string | number
  name: string
  images: Array<{ urlpath: string; isDefault?: boolean }>
  basePrice: number
  isSale: boolean
  salePrice?: number
  reviews?: Array<{ id: string; rating: number }>
  totalPurchases?: number
}

export interface ProductDataProps {
  id: string
  name: string
  description: string
  sellerId: string
  createdAt: string
  updatedAt: string
  basePrice: number
  category?: { id: string, name: string } | null
  subCategory?: { id: string, name: string } | null
  isSale: boolean
  isActive: boolean
  adminApproved?: boolean
  salePrice?: number
  keywords: string[]
  totalPurchases: number
  images: Array<{
    urlpath: string
    isDefault: boolean
    alt?: string
  }>
  seller: {
    id: string
    userId: string
    companyName: string
    createdAt: string
    storeRatingSummary: {
      id: string
      sellerId: string
      average: number
      totalCount: number
      updatedAt: string
    }
  }
  status: string
  reviews: Array<{
    id: string
    rating: number
  }>
  quantity: number
  variantCombination?: string[]
  variants: ProductVariant[]
  shippingMethods: ShippingMethod[]
}
export interface ProductPageProps {
  id: number
  title: string
  ratings: number
  totalRatings: number
  totalSold: number
  price: number
  description: string
  addDescriptionType?: string[]
  addDescriptionTypeDetails?: VariantDetails
  image: string[]
  altImage: string[]
  sellerId: string
  reviews: number
}

export interface ProductVariant {
  id: string
  title: string
  option: string
  hasPrice?: boolean
  price?: number
}

export interface ProductImageProps {
  id: string
  urlpath: string
  alt?: string
  isDefault: boolean
}
export interface ProductReview {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  productId: string
  rating: number
  title: string
  comment: string
  variant: ProductVariant[]
  images: ProductImageProps[]
  createdAt: string
}

export interface Cart {
  id: string
  buyerId: string
  createdAt: string
  updatedAt: string
  items: CartItem[]
}

export interface CartItem {
  id: string
  buyerId: string
  productId: string
  name: string
  variantId?: string
  quantity: number
  isSale: boolean
  salePrice: number
  basePrice: number
  seller: {
    id: string
    userId: string
    companyName: string
    createdAt: string
    storeRatingSummary: {
      id: string
      sellerId: string
      average: number
      totalCount: number
      updatedAt: string
    }
  }
  images: string
  sellerId?: string
  product?: {
    sellerId?: string
    seller: {
      id: string
    }
    shippingMethods: ShippingMethod[]
    variants?: ProductVariant[]
    colors?: { id: string; name: string }[]
  }
  variantCombination: string[] // Array of variant IDs
  variants: ProductVariant[]
}

export interface VariantState {
  variants: ProductVariant[]
  saveVariant: (variants: ProductVariant[]) => void
  areAllVariantsSelected: (
    groupedVariants: { title: string; variants: ProductVariant[] }[],
    selectedVariants: { [title: string]: string }
  ) => boolean
}

//currency formatter
export interface CurrencyFormatterProps {
  amount: number
  currency?: string
  locale?: string
  minimumFractionDigits?: number
}

interface VariantDetails {
  [key: string]: string[]
}

export interface FieldConfig {
  show: boolean
  required?: boolean
}

export interface ShopFormValues {
  shopName: string
  email: string
  pickupAddress: string
  contactNumber: string
}

export interface BusinessFormValues {
  businessRegisteredName: string
  individualRegisteredName: string
  registeredAddress: string
  businessType: string
  businessDocumentType: string
  businessDocumentFile: string
  businessDocumentFileUrl?: string
  businessEmail: string
  businessPhoneNumber: string
  companyRegisteredName: string
  shippingTerms?: string
  returnsTerms?: string
}

export interface FormRef {
  validateForm: () => Promise<boolean>
  getFormValues: () => ShopFormValues | BusinessFormValues
}

export interface BusinessTypeFormValues extends BusinessFormValues {
  individualFirstName?: string
  individualMiddleName?: string
  individualLastName?: string
  individualSuffix?: string
  businessDocumentFileUrl?: string
  shippingTerms?: string
  returnsTerms?: string
  [key: string]: unknown // Allow additional properties
}

export interface BusinessTypeFormProps {
  businessType: 'Sole Propriertorship' | 'Corporation'
  fields?: Record<string, { show: boolean; required?: boolean }>
  initialData?: BusinessTypeFormValues | null
  sellerProfileId?: string
}
export interface BusinessInformationFormProps {
  fields?: {
    businessRegisteredName?: FieldConfig
    individualRegisteredName?: FieldConfig
    registeredAddress?: FieldConfig
    businessDocumentType?: FieldConfig
    businessDocumentFile?: FieldConfig
    businessEmail?: FieldConfig
    businessPhoneNumber?: FieldConfig
    companyRegisteredName?: FieldConfig
  }
  initialData?: BusinessFormValues
  sellerProfileId?: string
}

export interface shopInformationFormProps {
  fields?: {
    shopName?: FieldConfig
    email?: FieldConfig
    pickupAddress?: FieldConfig
    contactNumber?: FieldConfig
  }
  initialData?: ShopFormValues
}

export interface BuyerAccountPageProps {
  name: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  addresses: UserAddress[]
}

export interface UserAddress {
  address: string
  label: string
  isDefault?: boolean
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface BuyerOrderItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
  image: string
  variantTitle?: string
  variantOption?: string
}

export interface BuyerOrderSummary {
  id: string
  status: string
  createdAt: string
  trackingLink: string
  totalAmount: number
  itemCount: number
  store: {
    id: string
    name: string
  }
  items: BuyerOrderItem[]
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  } | null
}

export interface OrdersPageProps {
  orders: BuyerOrderSummary[]
}

export interface OrderItem {
  id: string
  quantity: number
  priceAtPurchase: string
  shippingMethodPrice: number
  product: {
    id: string
    name: string
    images: Array<{
      urlpath: string
      alt: string
    }>
    isSale?: boolean
    basePrice?: number
    salePrice?: number
  }
  variant?: {
    id: string
    title: string
    option: string
    price: string
  }
}

export interface Order {
  id: string
  status: string
  createdAt: string
  trackingLink?: string
  sellerTotal: number
  sellerItemCount: number
  orderItems: OrderItem[]
  buyer: {
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      contactNumber: string
    }
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  EscrowPayment: {
    status: string
    amount: string
    releaseDate: string | null
  } | null
}

export interface StoreDetails {
  storeName: string
  storeId: number
}

export interface OrderStatus {
  statusType: string
  label: string
}
export interface SoleProprietorshipProps {
  id: number
  businessType: 'solePropriator'
  businessRegisteredName: string
  individualRegisteredName: string
  registeredAddress: string
  businessDocumentType: string
  businessDocumentFile: string
  businessEmail: string
  businessPhoneNumber: string
  companyRegisteredName: string
}

export interface CorporationProps {
  id: number
  businessType: 'corporation'
  businessRegisteredName: string
  registeredAddress: string
  businessDocumentType: string
  businessDocumentFile: string
  businessEmail: string
  businessPhoneNumber: string
  companyRegisteredName: string
}

export interface OnePersonCorporationProps {
  id: number
  businessType: 'onePersonCorpo'
  businessRegisteredName: string
  individualRegisteredName: string
  registeredAddress: string
  businessDocumentType: string
  businessDocumentFile: string
  businessEmail: string
  businessPhoneNumber: string
  companyRegisteredName: string
}

// Combined type using discriminated union
export type BusinessEntityData =
  | SoleProprietorshipProps
  | CorporationProps
  | OnePersonCorporationProps

// Type guard functions to check entity type
export const isSoleProprietorship = (
  entity: BusinessEntityData
): entity is SoleProprietorshipProps => {
  return entity.businessType === 'solePropriator'
}

export const isCorporation = (
  entity: BusinessEntityData
): entity is CorporationProps => {
  return entity.businessType === 'corporation'
}

export const isOnePersonCorporation = (
  entity: BusinessEntityData
): entity is OnePersonCorporationProps => {
  return entity.businessType === 'onePersonCorpo'
}

// SocketIO Messaging Types
export interface Message {
  id: string
  conversationId: string
  senderId: string
  content?: string
  sender: {
    id: string
    firstName?: string
    lastName?: string
    profilePicture?: string
    role: 'BUYER' | 'SELLER'
  }
  sentAt: string
}

export interface Conversation {
  id: string
  buyerId: string
  sellerId: string
  productId: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  hasUnread?: boolean
  buyer?: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
  }
  seller?: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
    sellerProfile: {
      id: string
      businessRegisteredName: string
      shopName: string
      companyName: string
      isVerified: boolean
      createdAt: string
      storeRatingSummary: {
        average: number
        totalCount: number
      }
    }
  }
  product?: {
    id: string
    name: string
    images?: Array<{
      url: string
      isDefault: boolean
    }>
  }
  messages?: Array<{
    id: string
    conversationId: string
    senderId: string
    content?: string
    sender: {
      id: string
      firstName?: string
      lastName?: string
      profilePicture?: string
      role: 'BUYER' | 'SELLER'
    }
    sentAt: string
  }>
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedDays: string
  description: string
  isActive: boolean
}

export type StatusType = 'SENT' | 'DELIVERED' | 'READ'

export interface AddressFormData {
  id?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
  label: string // Make sure this is included
}

export interface ExtendedAddress {
  id?: string
  address: string
  label: string // Make sure this is included
  isDefault?: boolean
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

// RAZORPAY TYPES
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  // eslint-disable-next-line
  handler: (response: any) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  modal: {
    ondismiss: () => void
  }
}
