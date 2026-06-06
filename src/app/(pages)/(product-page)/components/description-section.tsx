'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import {
  ProductImageProps,
  ProductReview,
  ProductVariant,
} from '@/app/types/type'
import { StarRating } from '@/app/components/ui-utils/star-rating'
import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const DescriptionTab = () => {
  const params = useParams()
  const id = params.id
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [isFirstPage, setIsFirstPage] = useState(true) //eslint-disable-line
  const [isLastPage, setIsLastPage] = useState(false) //eslint-disable-line
  const [currentPage, setCurrentPage] = useState(1)

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // console.log('Making API request for product ID:', id)
      const res = await axios.get(`/api/product-details/get?id=${id}`)
      return res.data
    },
  })

  const totalReviews = useMemo(() => {
    return selectedRating
      ? (product?.reviews || []).filter(
          (review: { rating: number }) => review.rating === selectedRating
        ).length
      : (product?.reviews && product.reviews.length) || 0
  }, [product?.reviews, selectedRating])

  const reviewsPerPage = 5
  const totalPages = Math.ceil(totalReviews / reviewsPerPage)

  // Set initial page states when totalPages changes
  useEffect(() => {
    setIsFirstPage(currentPage === 1)
    setIsLastPage(currentPage === totalPages || totalPages <= 1)
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return // Guard against invalid pages

    setCurrentPage(page)
    setIsFirstPage(page === 1)
    setIsLastPage(page === totalPages)
  }

  const filterReviews = useMemo(() => {
    if (!product?.reviews || product.reviews.length === 0) return []

    const filtered = selectedRating
      ? product.reviews.filter(
          (review: ProductReview) => review.rating === selectedRating
        )
      : product.reviews

    // Apply pagination
    const startIndex = (currentPage - 1) * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    return filtered.slice(startIndex, endIndex)
  }, [product?.reviews, selectedRating, currentPage])

  const groupedVariants = useMemo(() => {
    if (!product?.variants) return []

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

  const avgRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 0

    const total = product.reviews.reduce(
      (total: number, review: { rating: number }) => total + review.rating,
      0
    )
    return (total / product.reviews.length).toFixed(1)
  }

  const handleSelectedRating = (rating: number | null) => {
    setSelectedRating(rating)
    setCurrentPage(1) // Reset to first page when filter changes
    // console.log('Selected rating:', rating)
  }
  const tabSections = [
    {
      label: 'Description',
      value: 'description',
      content: product?.description,
    },
    {
      label: 'Additional Information',
      value: 'additionalInformation',
      content: (
        <>
          {groupedVariants && Object.keys(groupedVariants).length > 0 ? (
            <table className="w-full border-collapse">
              <tbody>
                {Object.entries(groupedVariants).map(
                  ([title, variants]: [string, ProductVariant[]]) => (
                    <React.Fragment key={title}>
                      <tr>
                        <td className="w-64 py-4 font-bold">{title}</td>
                        <td className="flex flex-1 py-4">
                          {variants.map((variant: ProductVariant) => (
                            <span key={variant.id} className="mx-4">
                              {variant.option}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <hr className="my-2" />
                        </td>
                      </tr>
                    </React.Fragment>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <span className="text-base font-medium">
                No additional information available.
              </span>
              <span className="mt-1 text-sm">
                Please check back later or contact support for more details.
              </span>
            </div>
          )}
        </>
      ),
    },
    {
      label: 'Reviews',
      value: 'reviews',
      content: (
        <div className="flex flex-col">
          <div className="flex flex-col items-start md:flex-row md:items-center">
            <span className="text-orange text-base md:text-[17px] px-2 md:px-6 mb-4 md:mb-0">
              {avgRating()} out of 5
            </span>
            <span className="flex flex-row flex-wrap gap-2 px-1 py-2 overflow-x-auto md:px-4 md:space-x-4 md:pl-84">
              <button
                onClick={() => handleSelectedRating(null)}
                className="px-2 py-1 text-sm cursor-pointer md:px-4 md:py-2 whitespace-nowrap"
              >
                All reviews
              </button>
              {[5, 4, 3, 2, 1].map((rating) => {
                return (
                  <button
                    key={rating}
                    className="px-2 py-1 text-sm cursor-pointer md:px-4 md:py-2 whitespace-nowrap"
                    onClick={() => handleSelectedRating(rating)}
                  >
                    {rating} star{rating !== 1 ? 's' : ''}
                  </button>
                )
              })}
            </span>
          </div>

          {/* Reviews List */}
          <div className="flex flex-col mt-6 space-y-6">
            {filterReviews.length > 0 ? (
              filterReviews.map((review: ProductReview, index: number) => {
                const formatDate = (date: string) => {
                  return new Date(date).toLocaleDateString('default', {
                    month: 'long',
                    year: 'numeric',
                  })
                }

                return (
                  <div
                    key={review.id || index}
                    className="pb-6 border-b last:border-b-0"
                  >
                    {/* User Info */}
                    <div className="flex items-start mb-4 space-x-4">
                      <Image
                        src={review.user?.profilePicture || '/default-user.png'}
                        width={60}
                        height={60}
                        alt="user profile"
                        className="object-cover w-12 h-12 border rounded-full md:w-15 md:h-15"
                      />
                      <div className="flex-1">
                        <h3 className="text-base font-semibold md:text-lg">
                          {review.user.firstName + ' ' + review.user.lastName}
                        </h3>
                        <p className="text-xs text-stone-500 md:text-sm">
                          {formatDate(review.createdAt)}
                        </p>
                        <div className="flex items-center mt-1">
                          {/* Star Rating Display */}
                          <StarRating rating={review.rating} />
                          <span className="ml-2 text-gray-600">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="ml-16 md:ml-20">
                      {review.title && (
                        <h4 className="mb-2 text-base font-semibold md:text-lg">
                          {review.title}
                        </h4>
                      )}
                      {review.comment && (
                        <p className="mb-4 text-sm text-gray-700 md:text-base">
                          {review.comment}
                        </p>
                      )}

                      {/* Review Images */}
                      {review.images &&
                        Array.isArray(review.images) &&
                        review.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {review.images.map(
                              (
                                image: ProductImageProps,
                                imageIndex: number
                              ) => (
                                <div
                                  key={
                                    image.id ||
                                    `image-${review.id}-${imageIndex}`
                                  }
                                  className="relative w-16 h-16 overflow-hidden border rounded-md md:w-20 md:h-20"
                                >
                                  <Image
                                    src={image.urlpath || '/default-image.png'}
                                    alt={
                                      image.alt ||
                                      `Review image ${imageIndex + 1}`
                                    }
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      console.log(
                                        'Image load error:',
                                        image.urlpath
                                      )
                                      e.currentTarget.src = '/default-image.png'
                                    }}
                                  />
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-center text-gray-500">
                {selectedRating
                  ? `No ${selectedRating} star${selectedRating !== 1 ? 's' : ''} reviews yet`
                  : `No reviews yet, be the first to review this product! `}
              </div>
            )}
          </div>

          {/* No Reviews Message */}
          {(!product?.reviews || product.reviews.length === 0) && (
            <div className="py-8 text-center text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          )}

          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage - 1)
                    }}
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(index + 1)
                    }}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      ),
    },
    {
      label: 'Shipping & Returns',
      value: 'shippingReturns',
      content: (
        <div className="flex flex-col">
          <div className="px-2 py-6 pt-2 md:px-10 md:py-20">
            <h1 className="font-bold text-base md:text-[17px] mb-2">
              Shipping
            </h1>
            <p className="text-sm md:text-base">
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Similique beatae sapiente at, deserunt doloribus ad, quas eius
              quisquam nemo commodi fugit! Quibusdam magnam exercitationem nisi
              laudantium, quo recusandae earum molestiae.
            </p>
          </div>
          <div className="px-2 pb-4 md:px-10">
            <h1 className="font-bold text-base md:text-[17px] mb-2">Returns</h1>
            <p className="text-sm md:text-base">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum
              cumque magni, iste asperiores deserunt tenetur animi aspernatur
              quo ex libero impedit quaerat natus facere sed sapiente laudantium
              eligendi. Rerum, quo.
            </p>
          </div>
        </div>
      ),
    },
  ]

  // Mobile Accordion view
  const renderMobileAccordion = () => {
    return (
      <Accordion type="single" collapsible className="w-full">
        {tabSections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger className="px-4 py-3 text-base font-medium">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 border-b">
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  // Desktop Tabs view
  const renderDesktopTabs = () => {
    return (
      <Tabs defaultValue="description">
        <TabsList className="w-full px-6 py-8 bg-stone-200">
          {tabSections.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="py-4 text-lg"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabSections.map((section) => (
          <TabsContent
            key={section.value}
            value={section.value}
            className="px-10 pt-10 border-2 rounded-xl pb-34"
          >
            {section.content}
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  return (
    <div className="justify-center mx-4 mb-10 md:mx-0">
      <div className="md:hidden">{renderMobileAccordion()}</div>
      <div className="hidden md:block">{renderDesktopTabs()}</div>
    </div>
  )
}

export default DescriptionTab
