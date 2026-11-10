/**
 * Decides whether a request may use the staff session cookie.
 *
 * Payload's own check refuses every cross-site page load. That would send staff back to the
 * login screen after Google's redirect, and whenever they open a lead link from Gmail. Opening
 * a page changes nothing, so top-level navigations are allowed. Anything that can change data
 * (fetches and form posts) must still come from this site. A cross-site form post is caught by
 * the Origin check, because browsers always send Origin on POST.
 */
export const canUseSessionCookie = (headers: Headers, allowedOrigins: string[]) => {
  const origin = headers.get('origin')
  if (origin) return allowedOrigins.includes(origin)

  const site = headers.get('sec-fetch-site')
  if (site === 'same-origin' || site === 'same-site' || site === 'none') return true

  return site === 'cross-site' && headers.get('sec-fetch-mode') === 'navigate'
}
