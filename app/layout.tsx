import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from './components/navbar'
import { Footer } from './components/footer'
import { ClientAnalytics } from './components/ClientAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
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
        <ClientAnalytics />
      </body>
    </html>
  )
}
