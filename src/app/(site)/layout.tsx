import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { footerNav, primaryNav } from '@/lib/navigation'
import { getPublicContact } from '@/lib/site-settings'
import './globals.css'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: { default: 'Deems Luxe Homes', template: '%s | Deems Luxe Homes' },
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const contact = await getPublicContact()
  // Becomes true when the first featured property is published
  const showFeatured = false

  return (
    <html lang="en-KE" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Header links={primaryNav({ showFeatured })} />
        <main id="main">{children}</main>
        <Footer groups={footerNav({ showFeatured })} contact={contact} />
        <WhatsAppButton number={contact.whatsapp} />
      </body>
    </html>
  )
}
