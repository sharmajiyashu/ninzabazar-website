type ProductListCartIconProps = {
  className?: string
}

function CartIcon() {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1 1H3.2L5.4 11.2C5.5 11.8 6 12.2 6.6 12.2H14.2C14.8 12.2 15.3 11.8 15.4 11.2L16.8 4.5H4.8"
        stroke="#007451"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.2" cy="14.2" r="1.2" fill="#007451" />
      <circle cx="13.2" cy="14.2" r="1.2" fill="#007451" />
    </svg>
  )
}

export default function ProductListCartIcon({
  className = '',
}: ProductListCartIconProps) {
  return (
    <span
      className={`box-border inline-flex h-[35px] w-[43px] shrink-0 items-center justify-center rounded-[7px] border border-[#007451] bg-white ${className}`}
    >
      <CartIcon />
    </span>
  )
}
