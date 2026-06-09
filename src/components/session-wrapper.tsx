'use client'
import { SessionProvider } from 'next-auth/react'
import React from 'react'

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  )
}

export default SessionWrapper
