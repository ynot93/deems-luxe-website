import config from '@payload-config'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { ButtonLink } from '@/components/ui/Button'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { RoofPhoto } from '@/components/ui/RoofPhoto'
import { showDrafts } from '@/lib/drafts'
import { getPublicContact } from '@/lib/site-settings'
import { stockPhotos } from '@/lib/stock-photos'
import type { Media } from '@/payload-types'

// The story, mission and CEO message wait for the owner's own words. Until then the page
// says only what the requirements establish about how Deems works.
const reviewed = true

export const metadata: Metadata = {
  title: 'About',
  description:
    'Deems Luxe Homes Limited works the other way round: you tell us what you want, and an agent brings you vetted options.',
}

const PRINCIPLES = [
  {
    title: 'You say what you want first',
    text: 'Instead of scrolling listings, you tell us what you need and your agent does the searching.',
  },
  {
    title: 'Every deal goes through an agent',
    text: 'Buyers and sellers never deal directly. Your agent arranges viewings, negotiates and handles the paperwork.',
  },
  {
    title: 'Your details stay private',
    text: 'Sellers and other agents never see your phone number or email. Only Deems staff do.',
  },
  {
    title: 'Every budget is welcome',
    text: 'From a first rental to a family home or a commercial building, anywhere in Kenya and for buyers abroad.',
  },
]

const getTeam = async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'team-members', depth: 1, limit: 50, overrideAccess: false })
  return docs.filter((member): member is typeof member & { photo: Media } => typeof member.photo === 'object')
}

export default async function AboutPage() {
  if (!reviewed && !showDrafts) notFound()
  const [team, contact] = await Promise.all([getTeam(), getPublicContact()])

  return (
    <>
      {reviewed ? null : <DraftRibbon note="About copy" />}

      <section className="page-gutter grid gap-10 pt-10 pb-16 md:pt-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <h1 className="text-h1">Property, the other way round</h1>
          <p className="text-lead mt-5 max-w-xl text-mute">
            Deems Luxe Homes Limited helps people buy, rent, sell and look after property across Kenya. Instead of
            asking you to search, we ask what you want, and a Deems agent brings you options that fit.
          </p>
        </div>
        <RoofPhoto
          photo={stockPhotos.nairobiCityscape}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3]"
        />
      </section>

      <section aria-labelledby="how-we-work" className="border-y border-line bg-white">
        <div className="page-gutter py-16 md:py-24">
          <h2 id="how-we-work" className="text-h1 max-w-2xl">
            How we work
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((principle) => (
              <li key={principle.title} className="border-t-2 border-purple pt-5">
                <h3 className="text-h3">{principle.title}</h3>
                <p className="mt-2 text-mute">{principle.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {team.length ? (
        <section aria-labelledby="team" className="page-gutter py-16 md:py-24">
          <h2 id="team" className="text-h1">
            Our team
          </h2>
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member.id}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-purple-tint">
                  <Image
                    src={member.photo.url ?? ''}
                    alt={member.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-h3 mt-4">{member.name}</h3>
                <p className="text-mute">{member.role}</p>
                {member.registration?.body && member.registration.number ? (
                  <p className="mt-1 text-sm text-mute">
                    {member.registration.body} registration {member.registration.number}
                  </p>
                ) : null}
                {member.bio ? <p className="mt-3">{member.bio}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {contact.officeAddress ? (
        <section aria-labelledby="office" className="page-gutter pb-16 md:pb-24">
          <h2 id="office" className="text-h2">
            Our office
          </h2>
          <address className="mt-4 whitespace-pre-line not-italic text-lead">{contact.officeAddress}</address>
          {contact.officeHours ? <p className="mt-2 text-mute">{contact.officeHours}</p> : null}
        </section>
      ) : null}

      <section aria-labelledby="start" className="roof on-dark bg-purple">
        <div className="page-gutter grid gap-6 pt-24 pb-16 md:grid-cols-[1fr_auto] md:items-end md:pt-32 md:pb-20">
          <div className="max-w-2xl">
            <h2 id="start" className="text-h1 text-white">
              Tell us what you’re looking for
            </h2>
            <p className="text-lead mt-4 text-mute-on-dark">It takes about 2 minutes, and you don’t need an account.</p>
          </div>
          <ButtonLink href="/post-a-request" variant="accent" size="lg">
            Post a Request
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
