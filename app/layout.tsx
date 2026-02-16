import React from "react"
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatWidget } from '@/components/chat-widget'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CampusCompass | Your One-Stop Hub for University in NSW',
  description: 'Personalized checklists, UAC dates, commute planner, rent estimates, benefits triage & more — all in one place for NSW high school students transitioning to university.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} font-sans antialiased`}>
        {children}
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  )
}
