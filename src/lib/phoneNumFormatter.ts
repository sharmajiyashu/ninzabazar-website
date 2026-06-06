import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function formatPhoneNumber(rawNumber: string) {
  const phoneNumber = parsePhoneNumberFromString(rawNumber)
  if (phoneNumber && phoneNumber.isValid()) {
    return phoneNumber.formatInternational() // e.g. "+63 912 345 6789"
  }
  return rawNumber // fallback if parsing fails
}
