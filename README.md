# Deems Luxe Homes website

The website for Deems Luxe Homes Limited. See `docs/requirements.md` for scope and `CLAUDE.md` for how the project is built.

## Getting started

Inside WSL, with Node 24 and pnpm:

```bash
pnpm install
cp .env.example .env   # then set PAYLOAD_SECRET
pnpm db:start
pnpm dev
```

The site runs at http://localhost:3000 and the admin panel at http://localhost:3000/admin.

## Admin sign-in

Staff sign in with Google. To set it up, create a web OAuth client in the Google Cloud console with the redirect URI `http://localhost:3000/api/auth/google/callback`. Then add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and your email as `BOOTSTRAP_ADMIN_EMAILS` to `.env`.
