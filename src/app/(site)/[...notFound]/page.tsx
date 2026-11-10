import { notFound } from 'next/navigation'

// The site and the admin have separate root layouts, so Next can't tell which one an unknown
// URL belongs to and shows a bare default page. This sends unknown URLs to the site's own 404.
export default function CatchAll() {
  notFound()
}
