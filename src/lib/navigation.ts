export type NavLink = { label: string; href: string }

export const POST_REQUEST_LINK: NavLink = { label: 'Post a Request', href: '/post-a-request' }

export const primaryNav = ({ showFeatured }: { showFeatured: boolean }): NavLink[] => [
  { label: 'Services', href: '/services' },
  ...(showFeatured ? [{ label: 'Featured Properties', href: '/featured-properties' }] : []),
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
]

export const footerNav = ({ showFeatured }: { showFeatured: boolean }) => [
  {
    title: 'Services',
    links: [
      { label: 'Property management', href: '/services/property-management' },
      { label: 'Property valuation', href: '/services/property-valuation' },
      { label: 'Real estate agency', href: '/services/real-estate-agency' },
    ],
  },
  {
    title: 'Company',
    links: [
      POST_REQUEST_LINK,
      ...(showFeatured ? [{ label: 'Featured properties', href: '/featured-properties' }] : []),
      { label: 'About', href: '/about' },
      { label: 'Insights', href: '/insights' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Help and legal',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Terms of use', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Cookie policy', href: '/cookies' },
    ],
  },
]
