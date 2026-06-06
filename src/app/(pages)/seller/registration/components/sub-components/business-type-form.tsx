import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react'
import { CloudUpload } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  BusinessTypeFormProps,
  FormRef,
  BusinessTypeFormValues,
} from '@/app/types/type'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import { useSupabaseUpload } from '@/app/hooks/useSupabaseUpload'
import { Loader2 } from 'lucide-react'
import { ControllerRenderProps } from 'react-hook-form'

type FormFieldNames =
  | 'businessRegisteredName'
  | 'individualRegisteredName'
  | 'individualFirstName'
  | 'individualMiddleName'
  | 'individualLastName'
  | 'individualSuffix'
  | 'registeredAddress'
  | 'businessDocumentType'
  | 'businessDocumentFile'
  | 'businessDocumentFileUrl'
  | 'businessEmail'
  | 'businessPhoneNumber'
  | 'companyRegisteredName'

const BusinessTypeForm = forwardRef<FormRef, BusinessTypeFormProps>(
  ({ fields = {}, initialData = null }, ref) => {
    const { uploadFile, isUploading } = useSupabaseUpload()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Default field configuration
    const defaultFields = {
      businessRegisteredName: { show: true, required: true },
      individualRegisteredName: { show: true, required: true },
      registeredAddress: { show: true, required: true },
      businessDocumentType: { show: true, required: true },
      businessDocumentFile: { show: true, required: true },
      businessEmail: { show: true, required: true },
      businessPhoneNumber: { show: true, required: true },
      companyRegisteredName: { show: false, required: false },
      shippingTerms: { show: true, required: true },
      returnsTerms: { show: true, required: true },
    }

    const fieldConfig = { ...defaultFields, ...fields }

    const form = useForm({
      defaultValues: initialData || {
        businessRegisteredName: '',
        individualRegisteredName: '',
        individualFirstName: '',
        individualMiddleName: '',
        individualLastName: '',
        individualSuffix: '',
        registeredAddress: '',
        businessDocumentType: '',
        businessDocumentFile: '',
        businessDocumentFileUrl: '',
        businessEmail: '',
        businessPhoneNumber: '',
        companyRegisteredName: '',
        shippingTerms: '',
        returnsTerms: '',
      },
      mode: 'onChange',
    })

    const uploadBeforeSubmit = async () => {
      if (selectedFile) {
        try {
          const { fullPath } = await uploadFile(
            selectedFile,
            'business-documents'
          )
          form.setValue('businessDocumentFileUrl', fullPath)
          form.setValue('businessDocumentFile', fullPath)
        } catch (err) {
          console.error('File upload failed:', err)
          return false
        }
      }
      return true
    }

    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const uploadSuccess = await uploadBeforeSubmit()
        if (!uploadSuccess) return false

        const result = await form.trigger()
        if (!result) {
          const fieldNames = Object.keys(form.formState.errors)
          if (fieldNames.length > 0) {
            form.setFocus(fieldNames[0] as FormFieldNames)
          }
        }
        return result
      },
      getFormValues: () => {
        const values = form.getValues()

        const fullName = [
          values.individualFirstName || '',
          values.individualMiddleName || '',
          values.individualLastName || '',
          values.individualSuffix || '',
        ]
          .filter(Boolean)
          .join(' ')

        return {
          businessRegisteredName: values.businessRegisteredName || '',
          registeredAddress: values.registeredAddress || '',
          businessType: values.businessType,
          businessDocumentType: values.businessDocumentType || '',
          businessDocumentFile: values.businessDocumentFile || '',
          businessEmail: values.businessEmail || '',
          businessPhoneNumber: values.businessPhoneNumber || '',
          companyRegisteredName: values.companyRegisteredName || '',
          shippingTerms: values.shippingTerms || '',
          returnsTerms: values.returnsTerms || '',
          individualRegisteredName:
            fullName || values.individualRegisteredName || '',
        }
      },
    }))

    useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (
          name === 'individualFirstName' ||
          name === 'individualMiddleName' ||
          name === 'individualLastName' ||
          name === 'individualSuffix'
        ) {
          const firstName = value.individualFirstName || ''
          const middleName = value.individualMiddleName || ''
          const lastName = value.individualLastName || ''
          const suffix = value.individualSuffix || ''

          const fullName = [firstName, middleName, lastName, suffix]
            .filter(Boolean)
            .join(' ')

          if (fullName) {
            form.setValue('individualRegisteredName', fullName)
          }
        }
      })

      return () => subscription.unsubscribe()
    }, [form])

    // Create a new component for address fields
    const AddressFields = ({
      field,
    }: {
      field: ControllerRenderProps<BusinessTypeFormValues, 'registeredAddress'>
    }) => {
      const [addressParts, setAddressParts] = useState<string[]>(() => {
        try {
          const addressValue =
            typeof field.value === 'string' ? field.value : ''
          const parts = addressValue.split(',')
          while (parts.length < 5) {
            parts.push('')
          }
          return parts
        } catch (e) {
          console.error(e)
          return ['', '', '', '', '']
        }
      })

      useEffect(() => {
        try {
          // Safely handle potential undefined or non-string values
          const addressValue =
            typeof field.value === 'string' ? field.value : ''
          const parts = addressValue.split(',')
          while (parts.length < 5) {
            parts.push('')
          }
          setAddressParts(parts)
        } catch (e) {
          console.error(e)
          setAddressParts(['', '', '', '', ''])
        }
      }, [field.value])

      // Update both state and form when parts change
      const updateAddressPart = (index: number, value: string) => {
        const newParts = [...addressParts]
        newParts[index] = value
        setAddressParts(newParts)
        field.onChange(newParts.join(','))
      }

      return (
        <FormItem className="flex flex-row whitespace-nowrap">
          <FormLabel className="text-[16px] px-6">
            <span className="text-red-500">*</span>Registered Address
          </FormLabel>
          <FormControl>
            <div className="mx-20">
              <div className="grid grid-cols-2 gap-2 grid-row-2 text-green">
                <Input
                  placeholder="Street"
                  className="mb-2 text-gray-600 w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                  value={addressParts[0] || ''}
                  onChange={(e) => updateAddressPart(0, e.target.value)}
                />
                <Input
                  placeholder="City"
                  className="mb-2 text-gray-600 w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                  value={addressParts[1] || ''}
                  onChange={(e) => updateAddressPart(1, e.target.value)}
                />
                <Input
                  placeholder="State"
                  className="mb-2 text-gray-600 w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                  value={addressParts[2] || ''}
                  onChange={(e) => updateAddressPart(2, e.target.value)}
                />
                <Input
                  placeholder="ZIP/Postal Code"
                  className="mb-2 text-gray-600 w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                  value={addressParts[3] || ''}
                  onChange={(e) => updateAddressPart(3, e.target.value)}
                />
                <Input
                  placeholder="Country"
                  className="mb-2 text-gray-600 w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                  value={addressParts[4] || ''}
                  onChange={(e) => updateAddressPart(4, e.target.value)}
                />
              </div>
            </div>
          </FormControl>
        </FormItem>
      )
    }

    return (
      <div>
        <Form {...form}>
          <form
            className="flex flex-col justify-center w-full pt-10 space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {fieldConfig.companyRegisteredName.show && (
              <FormField
                control={form.control}
                name="companyRegisteredName"
                rules={{ required: 'Company name is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Company Registered
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your business name"
                        className="w-[40%] mx-6 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.businessRegisteredName.show && (
              <FormField
                control={form.control}
                name="businessRegisteredName"
                rules={{ required: 'Business name is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Business Registered
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your business name"
                        className="w-[40%] mx-8 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.individualRegisteredName.show && (
              <FormField
                control={form.control}
                name="individualRegisteredName"
                rules={{}}
                render={({}) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Individual
                      Registered Name
                    </FormLabel>
                    <div className="grid grid-cols-2 grid-rows-2 gap-4 mx-6">
                      <FormField
                        control={form.control}
                        name="individualFirstName"
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              className="w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="individualMiddleName"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              placeholder="Middle Name"
                              className="w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="individualLastName"
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              className="w-50 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="individualSuffix"
                        render={({ field }) => (
                          <FormControl>
                            <div>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                              >
                                <SelectTrigger className="w-full rounded-xl border-disabledgrey text-[16px] px-4">
                                  <SelectValue placeholder="Suffix (Optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="Jr.">Jr.</SelectItem>
                                    <SelectItem value="II">II</SelectItem>
                                    <SelectItem value="III">III</SelectItem>
                                    <SelectItem value="Sr.">Sr.</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                        )}
                      />
                    </div>
                    <div className="ml-3 text-sm text-gray-500">
                      {[
                        form.watch('individualFirstName') || '',
                        form.watch('individualMiddleName') || '',
                        form.watch('individualLastName') || '',
                        form.watch('individualSuffix') || '',
                      ]
                        .filter(Boolean)
                        .join(' ') || 'No name entered'}
                    </div>

                    <FormMessage />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {fieldConfig.registeredAddress.show && (
              <FormField
                control={form.control}
                name="registeredAddress"
                rules={{ required: 'Shop name is required' }}
                render={({ field }) => <AddressFields field={field} />}
              />
            )}
            {fieldConfig.businessDocumentType.show && (
              <FormField
                control={form.control}
                name="businessDocumentType"
                rules={{ required: 'Shop name is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Business Document
                      Type
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <SelectTrigger className="w-[40%] rounded-xl border-disabledgrey text-[16px] px-4 mx-10">
                          <SelectValue placeholder="Select business document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup className="bg-white border-disabledgrey rounded-xl">
                            <SelectItem value="businessLicense">
                              Business License
                            </SelectItem>
                            <SelectItem value="taxIdentification">
                              Tax Identification
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.businessDocumentFile.show && (
              <FormField
                control={form.control}
                name="businessDocumentFile"
                rules={{ required: 'Business document is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Business Document
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        {!field.value ? (
                          // Upload button when no file is selected
                          <Button
                            type="button"
                            disabled={isUploading}
                            onClick={() =>
                              document.getElementById('file-upload')?.click()
                            }
                            className="w-[20%] mx-20 pl-20 pr-24 border-1 rounded-xl border-disabledgrey hover:border-green hover:text-green hover:bg-white bg-white text-[16px] text-black"
                          >
                            <span>
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CloudUpload />
                              )}
                            </span>
                            <span className="text-[16px]">
                              {isUploading ? 'Uploading...' : 'Upload'}
                            </span>
                          </Button>
                        ) : (
                          // Show file info with remove/change options when file exists
                          <div className="flex items-center gap-4 ml-20">
                            <div className="flex items-center">
                              <span className="text-ellipsis overflow-hidden max-w-[200px] mr-4">
                                {typeof field.value === 'string'
                                  ? field.value.split('/').pop()
                                  : (field.value as { name?: string })?.name ||
                                    'Uploaded file'}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  form.setValue('businessDocumentFile', '', {
                                    shouldValidate: true,
                                  })
                                  form.setValue('businessDocumentFileUrl', '', {
                                    shouldValidate: true,
                                  })
                                  const fileInput = document.getElementById(
                                    'file-upload'
                                  ) as HTMLInputElement
                                  if (fileInput) fileInput.value = ''
                                }}
                                className="text-red-500 border border-red-500 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setSelectedFile(file) // ✅ Save file for later upload
                              form.setValue('businessDocumentFile', file.name, {
                                shouldValidate: true,
                              })
                            }
                          }}
                        />
                        <input
                          type="hidden"
                          {...field}
                          value={field.value || ''}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="businessDocumentFileUrl"
              render={({ field }) => (
                <input type="hidden" {...field} value={field.value ?? ''} />
              )}
            />
            {fieldConfig.businessEmail.show && (
              <FormField
                control={form.control}
                name="businessEmail"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Business Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        className="w-[40%] mx-28 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.businessPhoneNumber.show && (
              <FormField
                control={form.control}
                name="businessPhoneNumber"
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Business Phone
                      Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        className="w-[40%] mx-12 py-3 px-4 border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        defaultCountry="IN"
                        international
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.shippingTerms.show && (
              <FormField
                control={form.control}
                name="shippingTerms"
                rules={{ required: 'Shipping terms is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Shipping Terms
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your shipping terms"
                        className="w-[40%] mx-26 px-4 pt-6 pb-12 justify-start border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {fieldConfig.returnsTerms.show && (
              <FormField
                control={form.control}
                name="returnsTerms"
                rules={{ required: 'Returns terms is required' }}
                render={({ field }) => (
                  <FormItem className="flex flex-row whitespace-nowrap">
                    <FormLabel className="text-[16px] px-6">
                      <span className="text-red-500">*</span>Returns Terms
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your returns terms"
                        className="w-[40%] mx-28 px-4 pt-6 pb-12 justify-start border-1 rounded-xl border-disabledgrey hover:border-green focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-green focus-visible:border-1 !text-[16px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </div>
    )
  }
)

BusinessTypeForm.displayName = 'BusinessTypeForm'
export default BusinessTypeForm
