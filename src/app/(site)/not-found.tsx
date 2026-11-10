import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <section className="page-gutter py-24 text-center md:py-36">
      <h1 className="text-h1">We can’t find that page</h1>
      <p className="text-lead mx-auto mt-4 max-w-xl text-mute">
        The link may be out of date. Go back to the homepage, or tell us what you’re looking for.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Go to homepage
        </ButtonLink>
        <ButtonLink href="/post-a-request" variant="outline" size="lg">
          Post a Request
        </ButtonLink>
      </div>
    </section>
  )
}
