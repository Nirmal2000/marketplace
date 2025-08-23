import { Inter } from 'next/font/google'
import './globals.css'
import { CivicAuthProvider } from '@civic/auth-web3/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'emcp',
  description: 'EMCP - Efficient Modular Compute Protocol for creating and managing MCPs',
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <CivicAuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </CivicAuthProvider>
      </body>
    </html>
  )
}
