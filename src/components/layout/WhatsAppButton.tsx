export const WhatsAppButton = ({ number }: { number?: string | null }) => {
  if (!number) return null

  return (
    <a
      href={`https://wa.me/${number.replace(/\D/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 z-30 inline-flex min-h-12 items-center rounded-full bg-[#0B6B4F] px-5 font-semibold text-white shadow-float hover:bg-[#08523C]"
    >
      Chat on WhatsApp
    </a>
  )
}
