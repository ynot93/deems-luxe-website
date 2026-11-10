// Unreviewed content shows in development with a DraftRibbon, and never in production.
export const showDrafts = process.env.NODE_ENV !== 'production'
