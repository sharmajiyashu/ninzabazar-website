'use client'
import * as React from 'react'
import Box from '@mui/material/Box'
import { Button } from '@heroui/button'
import { useRouter } from 'next/navigation'
import FirstForm from './sub-components/shop-information-form'
import SecondForm from './sub-components/business-information-form'
import { toast } from 'sonner'
import { FormRef, ShopFormValues, BusinessFormValues } from '@/app/types/type'
import { useSession } from 'next-auth/react'

export default function RegFormStepper() {
  const { data: session } = useSession()
  const router = useRouter()
  const steps = ['Shop Information', 'Business Information']
  const [activeStep, setActiveStep] = React.useState(0)
  const [skipped, setSkipped] = React.useState(new Set<number>())
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [shopFormData, setShopFormData] = React.useState<ShopFormValues>({
    shopName: '',
    email: '',
    pickupAddress: '',
    contactNumber: '',
  })

  const [businessFormData, setBusinessFormData] =
    React.useState<BusinessFormValues>({
      businessRegisteredName: '',
      individualRegisteredName: '',
      registeredAddress: '',
      businessType: 'Sole Propriertorship',
      businessDocumentType: '',
      businessDocumentFile: '',
      businessEmail: '',
      businessPhoneNumber: '',
      companyRegisteredName: '',
      shippingTerms: '',
      returnsTerms: '',
    })

  const firstFormRef = React.useRef<FormRef>(null)
  const secondFormRef = React.useRef<FormRef>(null)

  const isStepSkipped = (step: number) => {
    return skipped.has(step)
  }

  const submitRegistrationData = async () => {
    try {
      setIsSubmitting(true)

      const shopFormValues = (firstFormRef.current?.getFormValues() ||
        shopFormData) as ShopFormValues
      const businessFormValues = (secondFormRef.current?.getFormValues() ||
        businessFormData) as BusinessFormValues

      const formData = new FormData()

      formData.append('shopName', shopFormValues.shopName || '')
      formData.append('sellerEmail', shopFormValues.email || '')
      formData.append('pickupAddress', shopFormValues.pickupAddress || '')
      formData.append('sellerPhoneNumber', shopFormValues.contactNumber || '')

      formData.append(
        'businessType',
        businessFormValues.businessType || 'Sole Propriertorship'
      )
      formData.append(
        'businessRegisteredName',
        businessFormValues.businessRegisteredName || ''
      )
      formData.append(
        'individualRegisteredName',
        businessFormValues.individualRegisteredName || ''
      )
      formData.append(
        'registeredAddress',
        businessFormValues.registeredAddress || ''
      )
      formData.append(
        'businessDocumentType',
        businessFormValues.businessDocumentType || ''
      )
      formData.append('businessEmail', businessFormValues.businessEmail || '')
      formData.append(
        'businessPhoneNumber',
        businessFormValues.businessPhoneNumber || ''
      )
      formData.append(
        'companyName',
        businessFormValues.companyRegisteredName || ''
      )
      formData.append('shippingTerms', businessFormValues.shippingTerms || '')
      formData.append('returnsTerms', businessFormValues.returnsTerms || '')

      formData.append(
        'businessDocumentFileUrl',
        businessFormValues.businessDocumentFileUrl || ''
      )

      if (
        businessFormValues.businessDocumentFile &&
        typeof businessFormValues.businessDocumentFile !== 'string'
      ) {
        formData.append(
          'businessDocumentFile',
          businessFormValues.businessDocumentFile
        )
      } else {
        formData.append(
          'businessDocumentFile',
          businessFormValues.businessDocumentFile || ''
        )
      }

      // Debug: Log what's being sent
      console.log('FormData contents:')
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }

      const response = await fetch(`/api/seller-registration/POST?userId`, {
        method: 'POST',
        body: formData,
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(
          `Request failed with status ${response.status}: ${errorText.substring(0, 100)}...`
        )
      }

      await response.json()
      router.push('/seller/success')
      toast.success('Registration completed successfully!')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      )
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    let isValid = false

    if (activeStep === 0 && firstFormRef.current) {
      isValid = await firstFormRef.current.validateForm()
      if (!isValid) {
        toast.error('Please fill all required fields in Shop Information')
        return
      }
      const currentFormData =
        firstFormRef.current.getFormValues() as ShopFormValues
      setShopFormData(currentFormData)
    } else if (activeStep === 1 && secondFormRef.current) {
      isValid = await secondFormRef.current.validateForm()
      if (!isValid) {
        toast.error('Please fill all required fields in Business Information')
        return
      }
      const currentFormData =
        secondFormRef.current.getFormValues() as BusinessFormValues
      setBusinessFormData(currentFormData)
    }

    let newSkipped = skipped
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values())
      newSkipped.delete(activeStep)
    }

    if (activeStep === steps.length - 1) {
      await submitRegistrationData()
      return // Remove the duplicate router.push
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    setSkipped(newSkipped)
  }

  const handleBack = () => {
    if (activeStep === 1 && secondFormRef.current) {
      const currentFormData =
        secondFormRef.current.getFormValues() as BusinessFormValues
      setBusinessFormData(currentFormData)
    }

    setActiveStep((prevActiveStep) => Math.max(0, prevActiveStep - 1))
  }

  // Don't render if no session
  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 mb-4 border-4 rounded-full border-green border-t-transparent animate-spin"></div>
          <span className="text-lg text-gray-600">Loading ...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col mt-10">
      <div className="flex justify-center w-full mb-10">
        <div className="flex items-center w-2/3">
          {steps.map((label, index) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${
                      index <= activeStep
                        ? 'border-green bg-green text-white'
                        : 'border-green text-green'
                    }`}
                >
                  {index + 1}
                </div>
                <div className="text-[16px] font-medium">{label}</div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-grow mx-30">
                  <div
                    className={`h-0.5 ${index < activeStep ? 'bg-green' : 'bg-gray-300'} mb-4`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {activeStep === steps.length ? (
        <div className="flex flex-row pt-2">
          <div className="flex flex-auto" />
        </div>
      ) : (
        <>
          <div className="mt-20 mx-60">
            {activeStep === 0 && (
              <div className="mb-10">
                <FirstForm ref={firstFormRef} initialData={shopFormData} />
              </div>
            )}

            {activeStep === 1 && (
              <div className="form-container">
                <SecondForm
                  ref={secondFormRef}
                  initialData={businessFormData}
                />
              </div>
            )}
          </div>
          <Box className="flex flex-row mt-40 mx-60">
            <Box className="flex items-center flex-auto" />
            {activeStep > 0 && (
              <Button
                className="mx-4 px-12 py-6 text-black border-2 border-black rounded-xl text-[23px] hover:border-2 hover:border-green hover:text-green"
                onPress={handleBack}
                isDisabled={isSubmitting}
              >
                Back
              </Button>
            )}
            <Button
              className="px-12 py-6 text-white border-2 border-green bg-green rounded-xl text-[23px] hover:border-2 hover:border-green hover:text-green hover:bg-white"
              onPress={handleNext}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : activeStep === steps.length - 1 ? (
                'Submit'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </>
      )}
    </div>
  )
}
