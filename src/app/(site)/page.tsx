import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ComponentProps, ReactNode } from 'react'
import { QuickRequest } from '@/components/home/QuickRequest'
import { ButtonLink } from '@/components/ui/Button'
import { AudienceCard, Badge, ExampleCard, ExampleRequestCard, ServiceCard } from '@/components/ui/cards'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { PhotoWithCard, RoofPhoto } from '@/components/ui/RoofPhoto'
import { showDrafts } from '@/lib/drafts'
import { stockPhotos } from '@/lib/stock-photos'

// The copy is a draft until the owner signs it off. Partners, testimonials, featured
// properties, the CEO message and articles join the page once they have real content.
const reviewed = false

export const metadata: Metadata = {
  title: { absolute: 'Deems Luxe Homes | Tell us what you’re looking for' },
  description:
    'Tell Deems what you want to buy or rent anywhere in Kenya, and an agent brings you vetted options. Property management, valuation and agency services too.',
}

const BuyerStep = ({
  step,
  title,
  children,
  photo,
  card,
  photoSide,
}: {
  step: number
  title: string
  children: ReactNode
  photo: ComponentProps<typeof RoofPhoto>['photo']
  card: ReactNode
  photoSide: 'left' | 'right'
}) => (
  <li className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
    <div className={photoSide === 'left' ? 'md:order-2' : ''}>
      <Badge tone="purple">{`Step ${step}`}</Badge>
      <h3 className="text-h2 mt-4">{title}</h3>
      <p className="text-lead mt-4 max-w-lg text-mute">{children}</p>
    </div>
    <PhotoWithCard card={card} cardSide={photoSide === 'left' ? 'right' : 'left'}>
      <RoofPhoto photo={photo} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/3]" />
    </PhotoWithCard>
  </li>
)

const SellerStep = ({ step, title, children }: { step: number; title: string; children: ReactNode }) => (
  <li>
    <span aria-hidden className="font-display text-h2 text-purple">
      {step}
    </span>
    <h3 className="text-h3 mt-2">{title}</h3>
    <p className="mt-2 text-mute">{children}</p>
  </li>
)

const TrustPoint = ({ title, children }: { title: string; children: ReactNode }) => (
  <li className="border-t border-white/20 pt-5">
    <h3 className="text-h3 text-white">{title}</h3>
    <p className="mt-2 text-mute-on-dark">{children}</p>
  </li>
)

export default function HomePage() {
  if (!reviewed && !showDrafts) notFound()

  return (
    <>
      {reviewed ? null : <DraftRibbon note="homepage copy" />}

      <section className="page-gutter grid gap-12 pt-10 pb-16 md:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <h1 className="text-display">Tell us what you’re looking for</h1>
          <p className="text-lead mt-5 max-w-xl text-mute">
            A Deems agent brings you vetted homes, land and offices to buy or rent, anywhere in Kenya. You skip
            the listings, and your number never goes to sellers.
          </p>
          <div className="mt-8 max-w-xl">
            <QuickRequest />
          </div>
        </div>
        <PhotoWithCard
          card={
            <ExampleRequestCard
              title="3-bed apartment to rent"
              location="Kilimani, Nairobi"
              budget="Up to KES 120,000 a month"
              timing="From January"
            />
          }
        >
          <RoofPhoto
            photo={stockPhotos.apartmentsPalms}
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/3] lg:aspect-[4/5]"
          />
        </PhotoWithCard>
      </section>

      <section aria-labelledby="sides" className="roof on-dark bg-purple">
        <div className="page-gutter pt-24 pb-14 md:pt-36 md:pb-20">
          <h2 id="sides" className="text-h1 max-w-3xl text-white">
            Whichever side you’re on, a Deems agent handles it
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <AudienceCard
              title="Looking for a property"
              description="Tell us what you want to buy or rent, and your agent brings you options that fit, with the documents checked."
              href="/post-a-request"
              linkLabel="Post a Request"
            />
            <AudienceCard
              title="Have a property"
              description="Selling or letting? Hand it to a Deems agent, who prices it, finds the buyer or tenant and handles the paperwork."
              href="/services/real-estate-agency"
              linkLabel="Talk to an agent"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="looking" className="page-gutter py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 id="looking" className="text-h1">
            How it works when you’re looking
          </h2>
          <p className="text-lead mt-4 text-mute">
            You tell us once. Your agent does the searching, checking and chasing.
          </p>
        </div>
        <ol className="mt-14 grid gap-20 md:mt-20 md:gap-28">
          <BuyerStep
            step={1}
            title="Tell us what you want"
            photo={stockPhotos.nairobiResidential}
            photoSide="right"
            card={
              <ExampleRequestCard
                title="4-bed maisonette to buy"
                location="Syokimau or Kitengela"
                budget="KES 15 to 20 million, mortgage"
                timing="Within 6 months"
              />
            }
          >
            Buy or rent, where, your budget, and the must-haves like parking, a DSQ or backup power. Your agent
            calls you to confirm the details.
          </BuyerStep>
          <BuyerStep
            step={2}
            title="Your agent screens every option"
            photo={stockPhotos.carvedDoor}
            photoSide="left"
            card={
              <ExampleCard title="Your shortlist">
                <ul className="grid gap-2">
                  {[
                    ['Kilimani, 3 bed', 'KES 115,000'],
                    ['Lavington, 3 bed', 'KES 120,000'],
                    ['Kileleshwa, 3 bed', 'KES 105,000'],
                  ].map(([place, rent]) => (
                    <li key={place} className="flex justify-between gap-4 border-t border-line pt-2">
                      <span className="font-medium">{place}</span>
                      <span className="text-mute">{rent}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-medium text-purple">Documents checked on all 3</p>
              </ExampleCard>
            }
          >
            Your agent finds properties that match, from owners, landlords and other agents. Poor fits are turned
            down, and ownership documents are checked before anything reaches you.
          </BuyerStep>
          <BuyerStep
            step={3}
            title="Viewings and paperwork handled"
            photo={stockPhotos.houseKeys}
            photoSide="right"
            card={
              <ExampleCard title="Viewing booked">
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-mute">When</dt>
                  <dd className="font-medium">Saturday, 10:00</dd>
                  <dt className="text-mute">Where</dt>
                  <dd className="font-medium">Kilimani, Nairobi</dd>
                </dl>
                <p className="mt-3 text-mute">Your agent meets you at the gate.</p>
              </ExampleCard>
            }
          >
            Your agent books viewings with both sides and comes with you. When you choose, they negotiate, prepare
            the lease or sale agreement, and stay with you until you have the keys.
          </BuyerStep>
        </ol>
      </section>

      <section aria-labelledby="selling" className="border-y border-line bg-white">
        <div className="page-gutter py-20 md:py-24">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl">
              <h2 id="selling" className="text-h1">
                Have a property to sell or let?
              </h2>
              <p className="text-lead mt-4 text-mute">Hand it to a Deems agent and keep your weekends.</p>
            </div>
            <div className="grid gap-3 sm:flex">
              <ButtonLink href="/services/real-estate-agency">Talk to an agent</ButtonLink>
              <ButtonLink href="/services/property-management" variant="outline">
                Property management
              </ButtonLink>
            </div>
          </div>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <SellerStep step={1} title="Tell us about the property">
              Where it is, what it is, and the price or rent you have in mind.
            </SellerStep>
            <SellerStep step={2} title="Your agent prices and markets it">
              Your agent advises on price and puts it in front of buyers and tenants whose requests fit.
            </SellerStep>
            <SellerStep step={3} title="Viewings to completion">
              Your agent runs viewings, negotiates, and handles the agreement through to transfer or move-in.
            </SellerStep>
          </ol>
        </div>
      </section>

      <section aria-labelledby="trust" className="roof on-dark bg-ink">
        <div className="page-gutter grid gap-12 pt-24 pb-16 md:grid-cols-2 md:items-center md:gap-16 md:pt-36 md:pb-24">
          <div>
            <h2 id="trust" className="text-h1 text-white">
              Your details stay with your agent
            </h2>
            <ul className="mt-10 grid gap-6">
              <TrustPoint title="Your number stays private">
                Owners and other agents never see your phone number or email. Every call and message goes through
                your agent.
              </TrustPoint>
              <TrustPoint title="Documents checked first">
                Your agent checks the title and who owns the property before you’re asked to view it.
              </TrustPoint>
              <TrustPoint title="No money before a viewing">
                Don’t pay a deposit or viewing fee before you’ve seen the property and its documents. If anyone
                using the Deems name asks you to, call us first.
              </TrustPoint>
            </ul>
          </div>
          <RoofPhoto
            photo={stockPhotos.keyInDoor}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] md:aspect-[4/5]"
          />
        </div>
      </section>

      <section aria-labelledby="services" className="page-gutter py-20 md:py-28">
        <div className="max-w-2xl">
          <h2 id="services" className="text-h1">
            Services for property owners
          </h2>
          <p className="text-lead mt-4 text-mute">
            Beyond finding property, Deems manages, values and sells it.
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <ServiceCard
            title="Property management"
            description="Tenant placement, rent collection, repairs and monthly statements for your property."
            href="/services/property-management"
            linkLabel="Explore property management"
            photo={stockPhotos.nairobiTowers}
          />
          <ServiceCard
            title="Property valuation"
            description="Valuations for sale, mortgage, insurance, probate, rent reviews and land."
            href="/services/property-valuation"
            linkLabel="Explore property valuation"
            photo={stockPhotos.landCityView}
          />
          <ServiceCard
            title="Real estate agency"
            description="Pricing advice, marketing, negotiation and support through to transfer, for sellers and buyers."
            href="/services/real-estate-agency"
            linkLabel="Explore real estate agency"
            photo={stockPhotos.nairobiCityscape}
          />
        </div>
      </section>
    </>
  )
}
