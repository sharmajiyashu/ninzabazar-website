import React, { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { shopInformationFormProps, FormRef } from '@/app/types/type'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const defaultFields = {
  shopName: { show: true, required: true },
  email: { show: true, required: true },
  pickupAddress: { show: true, required: true },
  contactNumber: { show: true, required: true },
}

const FirstForm = forwardRef<FormRef, shopInformationFormProps>(
  ({ fields = {}, initialData }, ref) => {
    const form = useForm({
      defaultValues: initialData || {
        shopName: '',
        email: '',
        pickupAddress: '',
        contactNumber: '',
      },
      mode: 'onChange', // Validate on change for immediate feedback
    })

    const fieldConfig = { ...defaultFields, ...fields }

    // Expose form validation method to parent
    useImperativeHandle(ref, () => ({
      validateForm: async () => {
        const result = await form.trigger()
        if (!result) {
          // Automatically focus on the first error field
          const fieldNames = Object.keys(form.formState.errors)
          if (fieldNames.length > 0) {
            form.setFocus(
              fieldNames[0] as
                | 'shopName'
                | 'email'
                | 'pickupAddress'
                | 'contactNumber'
            )
          }
        }
        return result
      },
      getFormValues: () => {
        return form.getValues()
      },
    }))

    return (
      <Form {...form}>
        <form className="flex flex-col space-y-4">
          {fieldConfig.shopName.show && (
            <FormField
              control={form.control}
              name="shopName"
              rules={{ required: 'Shop name is required' }}
              render={({ field }) => (
                <FormItem className="flex flex-row whitespace-nowrap">
                  <FormLabel className="text-[16px] px-6">
                    <span className="text-red-500">*</span>Shop name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your shop name"
                      className={`w-[50%] px-4 mx-0.5 border-1 rounded-xl ${
                        form.formState.errors.shopName
                          ? 'border-red-500 focus-visible:border-red-500'
                          : 'border-disabledgrey hover:border-green focus-visible:border-green'
                      } focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-1 !text-[16px]`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {fieldConfig.email.show && (
            <FormField
              control={form.control}
              name="email"
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
                    <span className="text-red-500">*</span>Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className={`w-[50%] px-4 mx-10 border-1 rounded-xl ${
                        form.formState.errors.email
                          ? 'border-red-500 focus-visible:border-red-500'
                          : 'border-disabledgrey hover:border-green focus-visible:border-green'
                      } focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-1 !text-[16px]`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {fieldConfig.pickupAddress.show && (
            <FormField
              control={form.control}
              name="pickupAddress"
              rules={{ required: 'Pickup address is required' }}
              render={({ field }) => (
                <FormItem className="flex flex-row my-12 whitespace-nowrap">
                  <FormLabel className="text-[16px] px-6">
                    <span className="text-red-500">*</span>Pickup Address
                  </FormLabel>
                  <div className="flex flex-row items-center gap-10">
                    <FormControl>
                      <a
                        className={`mx-8 text-left line-clamp-3 ${form.formState.errors.pickupAddress ? 'text-red-500' : 'text-disabledgrey'}`}
                      >
                        {field.value
                          .split(',')
                          .map((part: string, index: number) => (
                            <div key={index} className="mb-1">
                              {part.trim()}
                            </div>
                          ))}
                      </a>
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          className="hover:bg-inherit bg-inherit text-[16px] text-green font-medium hover:underline"
                        >
                          Edit
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium text-green">
                            Edit Pickup Address
                          </h4>
                          <div className="flex flex-col text-green">
                            <a>Street</a>
                            <Input
                              placeholder="Street"
                              className="mb-2 text-gray-600"
                              value={field.value.split(',')[0] || ''}
                              onChange={(e) => {
                                const parts = field.value.split(',')
                                parts[0] = e.target.value
                                field.onChange(parts.join(','))
                              }}
                            />
                            <a>City</a>
                            <Input
                              placeholder="City"
                              className="mb-2 text-gray-600"
                              value={field.value.split(',')[1] || ''}
                              onChange={(e) => {
                                const parts = field.value.split(',')
                                parts[1] = e.target.value
                                field.onChange(parts.join(','))
                              }}
                            />
                            <a>State</a>
                            <Input
                              placeholder="State"
                              className="mb-2 text-gray-600"
                              value={field.value.split(',')[2] || ''}
                              onChange={(e) => {
                                const parts = field.value.split(',')
                                parts[2] = e.target.value
                                field.onChange(parts.join(','))
                              }}
                            />
                            <a>ZIP/Postal code</a>
                            <Input
                              placeholder="ZIP/Postal code"
                              className="mb-2 text-gray-600"
                              value={field.value.split(',')[3] || ''}
                              onChange={(e) => {
                                const parts = field.value.split(',')
                                parts[3] = e.target.value
                                field.onChange(parts.join(','))
                              }}
                            />
                            <a>Country</a>
                            <Input
                              placeholder="Country"
                              className="mb-2 text-gray-600"
                              value={field.value.split(',')[4] || ''}
                              onChange={(e) => {
                                const parts = field.value.split(',')
                                parts[4] = e.target.value
                                field.onChange(parts.join(','))
                              }}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormItem>
              )}
            />
          )}

          {fieldConfig.contactNumber.show && (
            <FormField
              control={form.control}
              name="contactNumber"
              rules={{ required: 'Contact number is required' }}
              render={({ field }) => (
                <FormItem className="flex flex-row whitespace-nowrap">
                  <FormLabel className="text-[16px] px-6">
                    <span className="text-red-500">*</span>Phone number
                  </FormLabel>
                  <div className="flex flex-row items-center gap-10">
                    <FormControl>
                      <a
                        className={`mx-8 ${form.formState.errors.contactNumber ? 'text-red-500' : 'text-disabledgrey'}`}
                      >
                        {field.value}
                      </a>
                    </FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="hover:bg-inherit bg-inherit text-[16px] text-green font-medium hover:underline">
                          Edit
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <PhoneInput
                          {...field}
                          defaultCountry="IN"
                          international
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    )
  }
)

FirstForm.displayName = 'FirstForm' // Add displayName for React DevTools
export default FirstForm
