import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BusinessTypeForm from './business-type-form'
import {
  FormRef,
  BusinessFormValues,
  BusinessInformationFormProps,
  BusinessTypeFormValues,
} from '@/app/types/type'

const SecondForm = forwardRef<FormRef, BusinessInformationFormProps>(
  ({ initialData }, ref) => {
    const solePropriertorshipRef = useRef<FormRef>(null)
    const corporationRef = useRef<FormRef>(null)

    const [activeTab, setActiveTab] = React.useState('Sole Propriertorship')

    const solePropriertorshipFields = {
      businessRegisteredName: { show: true, required: true },
      individualRegisteredName: { show: true, required: true },
      registeredAddress: { show: true, required: true },
      businessDocumentType: { show: true, required: true },
      businessDocumentFile: { show: true, required: true },
      businessEmail: { show: true, required: true },
      businessPhoneNumber: { show: true, required: true },
      companyRegisteredName: { show: false },
    }

    const corporationFields = {
      businessRegisteredName: { show: true, required: true },
      individualRegisteredName: { show: false }, // Not needed for corporation
      registeredAddress: { show: true, required: true },
      businessDocumentType: { show: true, required: true },
      businessDocumentFile: { show: true, required: true },
      businessEmail: { show: true, required: true },
      businessPhoneNumber: { show: true, required: true },
      companyRegisteredName: { show: true, required: true },
    }

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        switch (activeTab) {
          case 'Sole Propriertorship':
            return (
              solePropriertorshipRef.current?.validateForm() ||
              Promise.resolve(false)
            )
          case 'Corporation':
            return (
              corporationRef.current?.validateForm() || Promise.resolve(false)
            )
          default:
            return Promise.resolve(false)
        }
      },
      getFormValues: () => {
        const emptyBusinessFormValues: BusinessFormValues = {
          businessRegisteredName: '',
          individualRegisteredName: '',
          businessType: activeTab,
          registeredAddress: '',
          businessDocumentType: '',
          businessDocumentFile: '',
          businessEmail: '',
          businessPhoneNumber: '',
          companyRegisteredName: '',
        }
        let formValues: BusinessFormValues
        switch (activeTab) {
          case 'Sole Propriertorship':
            formValues =
              (solePropriertorshipRef.current?.getFormValues() as BusinessFormValues) ||
              emptyBusinessFormValues
            break
          case 'Corporation':
            formValues =
              (corporationRef.current?.getFormValues() as BusinessFormValues) ||
              emptyBusinessFormValues
            break
          default:
            formValues = emptyBusinessFormValues
        }

        // Make sure businessType matches the selected tab
        formValues.businessType = activeTab
        return formValues
      },
    }))

    return (
      <div className="justify-center w-full">
        <Tabs defaultValue="Sole Propriertorship" onValueChange={setActiveTab}>
          <TabsList className="w-full gap-10 px-20 py-8">
            <TabsTrigger
              value="Sole Propriertorship"
              className="px-4 py-5 text-[19px] rounded-xl data-[state=active]:shadow-xl"
            >
              Sole Propriertorship
            </TabsTrigger>
            <TabsTrigger
              value="Corporation"
              className="text-wrap px-4 py-5 text-[19px] rounded-xl data-[state=active]:shadow-xl"
            >
              Corporation/ Partnership / Cooperative
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Sole Propriertorship" className="pt-5">
            <span className="font-semibold text-[20px] mx-4">
              Entity Information
            </span>
            <BusinessTypeForm
              businessType="Sole Propriertorship"
              ref={solePropriertorshipRef}
              fields={solePropriertorshipFields}
              initialData={initialData as BusinessTypeFormValues}
            />
          </TabsContent>
          <TabsContent value="Corporation" className="pt-5">
            <span className="font-semibold text-[20px] mx-4">
              Entity Information
            </span>
            <BusinessTypeForm
              businessType="Corporation"
              ref={corporationRef}
              fields={corporationFields}
              initialData={initialData as BusinessTypeFormValues}
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  }
)

SecondForm.displayName = 'SecondForm'
export default SecondForm
