import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from './components/navbar'
import { Footer } from './components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shreyash Gupta',
  description: 'Personal website of Shreyash Gupta - Analytics Leader and Technology Enthusiast',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

