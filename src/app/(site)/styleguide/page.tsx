import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ArticleCard, AudienceCard, Badge, ExampleRequestCard, ServiceCard } from '@/components/ui/cards'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { CheckboxField, ChoiceGroup, SelectInput, TextArea, TextInput } from '@/components/ui/form'
import { PhotoWithCard, RoofPhoto } from '@/components/ui/RoofPhoto'

export const metadata: Metadata = { title: 'Style guide', robots: { index: false } }

const swatches = [
  { name: 'Purple', hex: '#3F07C3', use: 'Buttons, links, headings', className: 'bg-purple text-white' },
  { name: 'Gold', hex: '#FFC900', use: 'Key actions, badges', className: 'bg-gold text-ink' },
  { name: 'Ink', hex: '#1A1530', use: 'Text, footer', className: 'bg-ink text-white' },
  { name: 'Paper', hex: '#FAF9FC', use: 'Page background', className: 'bg-paper text-ink border border-line' },
  { name: 'Line', hex: '#E6E3EE', use: 'Borders, dividers', className: 'bg-line text-ink' },
]

const Group = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-line py-10 md:py-14">
    <h2 className="text-h3 mb-6 text-mute">{title}</h2>
    {children}
  </section>
)

// Internal review page for the shared components. Not available in production.
export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <>
      <DraftRibbon note="internal style guide" />
      <div className="page-gutter py-10">
        <h1 className="text-h1 mb-10">Deems Luxe Homes style guide</h1>

        <Group title="Colour">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {swatches.map((swatch) => (
              <li key={swatch.name} className={`rounded-card p-5 ${swatch.className}`}>
                <p className="font-display font-semibold">{swatch.name}</p>
                <p className="text-sm">{swatch.hex}</p>
                <p className="mt-6 text-sm">{swatch.use}</p>
              </li>
            ))}
          </ul>
        </Group>

        <Group title="Type">
          <div className="grid max-w-4xl gap-6">
            <p className="text-display">Tell us what you’re looking for</p>
            <p className="text-h1">A Deems agent brings you vetted options</p>
            <p className="text-h2">Every offer is screened before you see it</p>
            <p className="text-h3">Property valuation</p>
            <p className="text-lead text-mute">
              Valuations for sale or purchase, mortgage and bank needs, insurance, probate and rent reviews.
            </p>
            <p className="max-w-prose">
              Body text is set for reading on a phone. Your contact details stay with your Deems agent, who
              arranges viewings with both sides and handles the paperwork through to completion.
            </p>
          </div>
        </Group>

        <Group title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Send my request</Button>
            <Button variant="accent">Post a Request</Button>
            <Button variant="outline">Learn more</Button>
            <Button size="lg">Send my request</Button>
            <Button disabled>Sending</Button>
            <Badge>New request</Badge>
            <Badge tone="purple">Verified</Badge>
          </div>
          <div className="on-dark mt-6 flex flex-wrap gap-3 rounded-card bg-ink p-6">
            <ButtonLink href="/post-a-request" variant="accent">
              Post a Request
            </ButtonLink>
            <ButtonLink href="/services" variant="outline-on-dark">
              See our services
            </ButtonLink>
          </div>
        </Group>

        <Group title="Form fields">
          <form className="grid max-w-xl gap-5">
            <ChoiceGroup
              legend="What are you looking to do?"
              name="intent"
              defaultValue="rent"
              options={[
                { label: 'Buy', value: 'buy' },
                { label: 'Rent', value: 'rent' },
              ]}
            />
            <TextInput label="Your name" autoComplete="name" />
            <TextInput
              label="Phone number"
              type="tel"
              hint="Your agent calls this number to confirm your request."
              defaultValue="0712"
              error="Enter a full phone number, for example 0712 345 678."
            />
            <SelectInput label="Property type" defaultValue="apartment">
              <option value="apartment">Apartment</option>
              <option value="maisonette">Maisonette</option>
              <option value="bungalow">Bungalow</option>
            </SelectInput>
            <TextArea label="Anything else we should know?" optional />
            <CheckboxField>I agree that Deems may use these details to handle my request.</CheckboxField>
            <CheckboxField error="Tick this box so we can handle your request.">
              I agree that Deems may use these details to handle my request.
            </CheckboxField>
          </form>
        </Group>

        <Group title="Roofline photo with floating card">
          <div className="max-w-3xl">
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
              <RoofPhoto className="aspect-[16/10]" />
            </PhotoWithCard>
          </div>
        </Group>

        <Group title="Service and article cards">
          <div className="grid gap-8 lg:grid-cols-2">
            <ServiceCard
              title="Property management"
              description="Tenant placement, rent collection, repairs and monthly statements for your property."
              href="/services/property-management"
              linkLabel="Explore property management"
            />
            <ServiceCard
              title="Property valuation"
              description="Valuations for sale, mortgage, insurance, probate, rent reviews and land."
              href="/services/property-valuation"
              linkLabel="Explore property valuation"
            />
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <ArticleCard
              title="How reverse listing works"
              excerpt="Say what you want, and let a Deems agent bring you options that fit."
              href="/insights"
            />
            <ArticleCard
              title="Title deed checks before you buy"
              excerpt="The checks to make before any money changes hands."
              href="/insights"
            />
            <ArticleCard
              title="Buying from abroad"
              excerpt="What diaspora buyers should plan for when buying property in Kenya."
              href="/insights"
            />
          </div>
        </Group>

        <Group title="Dark roofline band">
          <div className="roof on-dark bg-purple px-5 pt-20 pb-10 md:px-10 md:pt-28 md:pb-14">
            <h3 className="text-h2 max-w-2xl text-white">Whichever side you’re on, a Deems agent handles it</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <AudienceCard
                title="Looking for a property"
                description="Tell us what you want to buy or rent, and your agent brings you options that fit."
                href="/post-a-request"
                linkLabel="Post a Request"
              />
              <AudienceCard
                title="Have a property"
                description="Selling or letting? Hand it to a Deems agent, who matches it to people looking now."
                href="/services/real-estate-agency"
                linkLabel="Talk to an agent"
              />
            </div>
          </div>
        </Group>
      </div>
    </>
  )
}
