'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { ProfileBreadcrumb } from '../components/profile-breadcrumb'
import { UserProps } from '@/app/types/type'
import { ROUTES } from '@/lib/routes'

type DashboardStats = {
  inquiries: number
  orders: number
  messages: number
}

export default function AccountDashboardPage() {
  const { data: session, status } = useSession()

  const { data: user } = useQuery<UserProps>({
    queryKey: ['user', session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/getUser?id=${session?.user.id}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
    enabled: !!session?.user?.id,
  })

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['buyer-dashboard-stats', user?.buyerProfile?.id],
    queryFn: async () => {
      const buyerId = user?.buyerProfile?.id
      if (!buyerId) {
        return { inquiries: 0, orders: 0, messages: 0 }
      }

      const [conversationsRes, ordersRes] = await Promise.all([
        fetch('/api/conversations/get'),
        fetch(`/api/buyer-get-orders?buyerId=${buyerId}`),
      ])

      const conversations = conversationsRes.ok
        ? await conversationsRes.json()
        : []
      const ordersData = ordersRes.ok ? await ordersRes.json() : null

      return {
        inquiries: Array.isArray(conversations) ? conversations.length : 0,
        orders: ordersData?.orderCount ?? ordersData?.orders?.length ?? 0,
        messages: Array.isArray(conversations) ? conversations.length : 0,
      }
    },
    enabled: !!user?.buyerProfile?.id,
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-white">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : session?.user?.name || 'there'

  const cards = [
    {
      title: 'Total Inquiries Received',
      value: isLoading ? '—' : String(stats?.inquiries ?? 0),
    },
    {
      title: 'Total Orders',
      value: isLoading ? '—' : String(stats?.orders ?? 0),
      href: ROUTES.buyer.orders,
    },
    {
      title: 'Active Messages',
      value: isLoading ? '—' : String(stats?.messages ?? 0),
      href: ROUTES.buyer.messages,
    },
    {
      title: 'Account Status',
      value: 'Active',
    },
  ]

  return (
    <>
      <ProfileBreadcrumb
        items={[
          { label: 'Profile', href: ROUTES.buyer.account },
          { label: 'Dashboard' },
        ]}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-gray-500">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome Back, {fullName}!
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </>
  )
}

function DashboardCard({
  title,
  value,
  href,
}: {
  title: string
  value: string
  href?: string
}) {
  const content = (
    <div className="flex min-h-[120px] flex-col justify-between rounded-xl border border-gray-200 bg-[#f3f4f6] p-5 transition hover:border-[#006d44]/20 hover:bg-[#eef7f2]">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
