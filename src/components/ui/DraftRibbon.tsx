// Shown on unreviewed content in development. Production never renders unreviewed content.
export const DraftRibbon = ({ note }: { note?: string }) => (
  <p role="status" className="bg-gold px-4 py-2 text-center text-sm font-semibold text-ink">
    Draft for review{note ? `: ${note}` : ''}. Not visible on the live site.
  </p>
)
