'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { POST_REQUEST_LINK, type NavLink } from '@/lib/navigation'

export const Header = ({ links }: { links: NavLink[] }) => {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="page-gutter flex min-h-18 items-center justify-between gap-4">
        <Link href="/" aria-label="Deems Luxe Homes home" onClick={() => setMenuOpen(false)}>
          <Logo compactOnPhones />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? 'page' : undefined}
                  className="font-medium text-ink underline-offset-8 hover:text-purple aria-[current=page]:text-purple aria-[current=page]:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href={POST_REQUEST_LINK.href} variant="accent" className="whitespace-nowrap max-sm:px-3.5">
            {POST_REQUEST_LINK.label}
          </ButtonLink>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 items-center rounded-control border border-control px-4 font-semibold lg:hidden"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!menuOpen}
        className="border-t border-line bg-white pb-6 lg:hidden"
      >
        <ul className="page-gutter grid">
          {[{ label: 'Home', href: '/' }, ...links].map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-13 items-center text-lg font-medium"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="page-gutter mt-5">
          <ButtonLink href={POST_REQUEST_LINK.href} variant="accent" size="lg" className="w-full">
            {POST_REQUEST_LINK.label}
          </ButtonLink>
        </div>
      </nav>
    </header>
  )
}
