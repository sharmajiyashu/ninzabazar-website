import React from 'react'
import DocumentViewer from './sub-component/document-viewer'

interface CorporateEntityInformationProps {
  id: number
  businessType: string
  businessRegisteredName: string
  registeredAddress: string
  businessDocumentType: string
  businessDocumentFile: string
  businessEmail: string
  businessPhoneNumber: string
  companyRegisteredName: string
}

const CorporateEntityInformation: React.FC<CorporateEntityInformationProps> = (
  props
) => {
  const entities = [
    { label: 'Business Type', value: props.businessType },
    { label: 'Company Registered Name', value: props.companyRegisteredName },
    { label: 'Business Registered Name', value: props.businessRegisteredName },
    { label: 'Registered Address', value: props.registeredAddress },
    { label: 'Business Document Type', value: props.businessDocumentType },
    {
      label: 'Business Document',
      value: props.businessDocumentFile ? (
        <DocumentViewer filePath={props.businessDocumentFile} />
      ) : (
        <span className="text-gray-500 text-sm">No document uploaded</span>
      ),
    },
    { label: 'Business Email', value: props.businessEmail },
    { label: 'Business Phone Number', value: props.businessPhoneNumber },
  ]

  return (
    <div className="w-full mx-auto mt-6">
      <div className="space-y-4">
        {entities.map((entity, index) => (
          <div className="flex" key={index}>
            <div className="w-1/3 text-xs md:text-base text-right pr-8 text-gray-600">
              {entity.label}
            </div>
            <div className="w-2/3 text-xs md:text-base">{entity.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CorporateEntityInformation
