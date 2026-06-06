import React from 'react'
import DocumentViewer from './sub-component/document-viewer'

interface EntityInformationProps {
  id: number
  businessType: string
  businessRegisteredName: string
  individualRegisteredName: string
  registeredAddress: string
  businessDocumentType: string
  businessDocumentFile: string
  businessEmail: string
  businessPhoneNumber: string
}

const SoleProprietorship: React.FC<EntityInformationProps> = (data) => {
  const entities = [
    { label: 'Business Type', value: data.businessType },
    {
      label: 'Individual Registered Name',
      value: data.individualRegisteredName || 'N/A',
    },
    { label: 'Business Registered Name', value: data.businessRegisteredName },
    { label: 'Registered Address', value: data.registeredAddress },
    { label: 'Business Document Type', value: data.businessDocumentType },
    {
      label: 'Business Document File',
      value: data.businessDocumentFile ? (
        <DocumentViewer filePath={data.businessDocumentFile} />
      ) : (
        <span className="text-gray-500 text-sm">No document uploaded</span>
      ),
    },
    { label: 'Business Email', value: data.businessEmail },
    { label: 'Business Phone Number', value: data.businessPhoneNumber },
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

export default SoleProprietorship
