import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import type { NavLink } from '@/lib/navigation'
import type { PublicContact } from '@/lib/site-settings'

const linkClasses = 'text-mute-on-dark underline-offset-4 hover:text-white hover:underline'

export const Footer = ({
  groups,
  contact,
}: {
  groups: { title: string; links: NavLink[] }[]
  contact: PublicContact
}) => (
  <footer className="on-dark bg-ink text-white">
    <div className="page-gutter py-14 md:py-20">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Deems Luxe Homes home" className="inline-block">
            <Logo reversed />
          </Link>
          <div className="mt-6 grid gap-1 text-mute-on-dark">
            {contact.phone ? (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={linkClasses}>
                {contact.phone}
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className={linkClasses}>
                {contact.email}
              </a>
            ) : null}
            {contact.officeAddress ? <p className="whitespace-pre-line">{contact.officeAddress}</p> : null}
            {contact.officeHours ? <p>{contact.officeHours}</p> : null}
          </div>
        </div>

        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-display text-base font-semibold">{group.title}</h2>
            <ul className="mt-4 grid gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <p className="mt-14 border-t border-white/15 pt-6 text-sm text-mute-on-dark">
        © {new Date().getFullYear()} Deems Luxe Homes Limited
      </p>
    </div>
  </footer>
)
