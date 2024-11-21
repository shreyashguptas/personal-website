import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shreyash Gupta\'s Personal Website',
  description: 'A website about Shreyash Gupta aka ME!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow responsive">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
