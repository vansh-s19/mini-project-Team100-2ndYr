import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/context/Web3Context'
import { AuthProvider } from '@/context/AuthContext'
import { AIChat } from '@/components/AIChat'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LandChain - Secure Property Ownership on Blockchain',
  description: 'Register, verify, and transfer real estate with AI-powered OCR and decentralized storage on blockchain.',
  icons: {
    icon: [
      {
        url: '/landchain-logo.png',
      },
    ],
    apple: '/landchain-logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Web3Provider>
            {children}
            <AIChat />
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  )
}
