import { revalidatePath } from 'next/cache'

// Public pages are built ahead of time, so they keep showing old content after staff edit it
// in the admin panel until they're rebuilt. Content hooks call this to rebuild them.
// Outside a Next request (scripts, migrations) there is nothing to rebuild, so it does nothing.
export const rebuildPages = (path = '/', type: 'layout' | 'page' = 'layout') => {
  try {
    revalidatePath(path, type)
  } catch {
    // Not running inside Next
  }
}
