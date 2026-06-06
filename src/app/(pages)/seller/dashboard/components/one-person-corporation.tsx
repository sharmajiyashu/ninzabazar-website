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
  companyRegisteredName: string
}

const OnePersonCorporation: React.FC<EntityInformationProps> = (props) => {
  const entities = [
    { label: 'Business Type', value: props.businessType },
    { label: 'Corporation Name', value: props.companyRegisteredName },
    { label: 'Incorporator Name', value: props.individualRegisteredName },
    { label: 'General Location', value: props.registeredAddress },
    { label: 'Registered Address', value: props.registeredAddress },
    {
      label: 'Zip Code',
      value: props.registeredAddress.split(',').at(-1)?.trim(),
    },
    {
      label: 'Articles of Incorporation',
      value: props.businessDocumentFile ? (
        <DocumentViewer filePath={props.businessDocumentFile} />
      ) : (
        <span className="text-gray-500 text-sm">No document uploaded</span>
      ),
    },
    { label: 'Government ID Type', value: props.businessDocumentType },
    { label: 'Government ID (w/ Photo)', value: props.businessDocumentFile },
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

export default OnePersonCorporation
