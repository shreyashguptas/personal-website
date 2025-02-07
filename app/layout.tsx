import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ClientAnalytics } from '@/components/shared/ClientAnalytics'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shreyash Gupta',
  description: 'Personal website of Shreyash Gupta',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon96.png', sizes: '96x96' },
    ],
    apple: [
      { url: '/apple.png' }
    ],
    other: [
      {
        rel: 'manifest',
        url: '/site.webmanifest'
      }
    ]
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="max-w-[1400px] w-[92%] mx-auto py-4">
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
        <ClientAnalytics />
      </body>
    </html>
  )
}
