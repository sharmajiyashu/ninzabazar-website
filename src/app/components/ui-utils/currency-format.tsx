import { CurrencyFormatterProps } from '@/app/types/type'

const CurrencyFormatter = ({
  amount,
  currency = 'INR',
  locale = 'en-IN',
  minimumFractionDigits = 0,
}: CurrencyFormatterProps) => {
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits,
  }).format(amount)

  return <span>{formattedAmount}</span>
}

export default CurrencyFormatter
