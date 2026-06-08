import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Categories from './sub-components/categories'

type HeroActionCard = {
  title: string
  bgColor: string
  image: string
  link?: string
}

type HeroConfig = {
  headline?: string
  subtext?: string
  ctaText?: string
  ctaLink?: string
  imageUrl?: string
  actionCards?: HeroActionCard[]
}

type CategoryData = {
  id: string
  name: string
  imageUrl?: string | null
  subCategories?: { id: string; name: string; imageUrl?: string | null }[]
}

type HeroBannerProps = {
  topCategoriesTitle: string
  topCategories: CategoryData[]
  allCategories: CategoryData[]
  hero: HeroConfig | null
}

const defaultHero: HeroConfig = {
  headline: 'Buy & Sell Products\nAcross India',
  subtext: 'Connect with verified suppliers & distributors instantly.',
  ctaText: 'Buy Product',
  ctaLink: '/products',
  imageUrl: '/img/authentication/shopping_cart_3d.png',
  actionCards: [
    { title: 'Request for Quotation', bgColor: '#fce3f2', image: '/img/hero-cards/quotation_3d.png', link: '/products' },
    { title: 'Sell Your Products', bgColor: '#fdf0cd', image: '/img/hero-cards/sell_products_3d.png', link: '/seller/post' },
    { title: 'Grow Your Business', bgColor: '#ffd3d5', image: '/img/hero-cards/grow_business_3d.png', link: '/seller/dashboard' },
  ],
}

const HeroBanner = ({ topCategoriesTitle, topCategories, allCategories, hero }: HeroBannerProps) => {
  const parsedHero = typeof hero === 'object' && hero ? hero : {}
  const storedCards = Array.isArray(parsedHero.actionCards) ? parsedHero.actionCards : []
  const actionCards =
    storedCards.length > 0
      ? defaultHero.actionCards!.map((defaultCard, i) => ({
          ...defaultCard,
          ...(storedCards[i] || {}),
        }))
      : defaultHero.actionCards!

  const config = { ...defaultHero, ...parsedHero, actionCards }
  const headlineLines = (config.headline || '').split('\n')

  return (
    <div className="flex flex-col lg:flex-row gap-4 font-sans lg:items-stretch">
      <div className="hidden lg:block lg:w-64 shrink-0 self-stretch min-h-[480px]">
        <Categories
          title={topCategoriesTitle}
          topCategories={topCategories}
          allCategories={allCategories}
          className="h-full"
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-[480px]">
        <div className="flex-1 bg-gradient-to-r from-[#2066d2] to-[#4b8df2] rounded-2xl w-full overflow-hidden shadow-lg transition-shadow hover:shadow-xl duration-300 min-h-[220px] flex">
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-6 md:py-5 relative w-full">
            <div className="text-center md:text-left mb-6 md:mb-0 max-w-md z-10">
              <h1 className="text-white font-extrabold text-2xl md:text-3xl lg:text-4xl leading-tight mb-3 select-none">
                {headlineLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < headlineLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>
              <p className="text-white/90 text-xs md:text-sm font-medium mb-5 leading-relaxed select-none">
                {config.subtext}
              </p>
              <Link
                href={config.ctaLink || '/products'}
                className="inline-block bg-white text-[#2066d2] hover:bg-blue-50 font-bold px-6 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-md cursor-pointer active:scale-95"
              >
                {config.ctaText}
              </Link>
            </div>

            <div className="w-full md:w-auto flex justify-center z-10 shrink-0">
              <div className="relative w-40 h-40 md:w-52 md:h-52 flex items-center justify-center">
                <Image
                  fill
                  src={config.imageUrl || defaultHero.imageUrl!}
                  alt="Ninja Bazaar Shopping Cart"
                  className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] animate-pulse [animation-duration:4s]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 h-36">
          {actionCards.map((card) => (
            <Link
              key={card.title}
              href={card.link || '/products'}
              className="rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group h-full"
              style={{ backgroundColor: card.bgColor }}
            >
              <div className="flex-1 w-full relative flex items-center justify-center min-h-0">
                <div className="relative w-16 h-16 md:w-20 md:h-20">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <h3 className="text-[#1e293b] font-bold text-xs md:text-sm text-center leading-snug select-none shrink-0 mt-1">
                {card.title}
              </h3>
            </Link>
          ))}
        </div>

        <div className="block lg:hidden shrink-0">
          <Categories
            title={topCategoriesTitle}
            topCategories={topCategories}
            allCategories={allCategories}
          />
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
