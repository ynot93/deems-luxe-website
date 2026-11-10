import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

const variants = {
  primary: 'bg-purple text-white hover:bg-purple-dark',
  accent: 'bg-gold text-ink hover:bg-gold-dark',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-white',
  'outline-on-dark': 'border border-white text-white hover:bg-white hover:text-ink',
}

const sizes = {
  md: 'min-h-11 px-5 text-[0.9375rem]',
  lg: 'min-h-13 px-7 text-base',
}

type Style = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string }

const classes = ({ variant = 'primary', size = 'md', className = '' }: Style) =>
  `inline-flex items-center justify-center rounded-control font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`

export const Button = ({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: Style & ComponentProps<'button'>) => (
  <button type={type} className={classes({ variant, size, className })} {...props} />
)

export const ButtonLink = ({
  variant,
  size,
  className,
  href,
  children,
}: Style & { href: string; children: ReactNode }) => (
  <Link href={href} className={classes({ variant, size, className })}>
    {children}
  </Link>
)
