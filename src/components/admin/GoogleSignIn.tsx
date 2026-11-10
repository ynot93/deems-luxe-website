const errorMessages: Record<string, string> = {
  not_listed: 'That Google account isn’t on the staff list. Ask an admin to add your email, then try again.',
  deactivated: 'This staff account has been deactivated. Ask an admin to restore it.',
  account_mismatch: 'This email is linked to a different Google account. Sign in with the original account or ask an admin to reset it.',
  unverified_email: 'Google hasn’t verified this email address. Verify it with Google, then try again.',
  expired: 'That sign-in attempt expired. Start again.',
  google_failed: 'Google sign-in didn’t complete. Try again.',
  not_configured: 'Google sign-in isn’t set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the environment.',
}

export const GoogleSignIn = ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) => {
  const error = typeof searchParams?.error === 'string' ? errorMessages[searchParams.error] : undefined

  return (
    <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
      {error ? (
        <p
          role="alert"
          style={{ margin: 0, padding: '12px 16px', borderRadius: 8, background: '#FBEAE9', color: '#8C1D18' }}
        >
          {error}
        </p>
      ) : null}
      {/* A plain link because this starts a full-page redirect to Google */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/api/auth/google"
        style={{
          display: 'block',
          padding: '14px 20px',
          borderRadius: 8,
          background: '#3F07C3',
          color: '#FFFFFF',
          fontWeight: 600,
          textAlign: 'center',
          textDecoration: 'none',
        }}
      >
        Sign in with Google
      </a>
      <p style={{ margin: 0, color: 'var(--theme-elevation-600)', fontSize: 14, textAlign: 'center' }}>
        For Deems staff. Ask an admin to add your email if you can’t get in.
      </p>
    </div>
  )
}
