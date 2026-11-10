# Deems Luxe Homes — Website Requirements

Oct 15, 2026 · @Kim

## Overview

Deems Luxe Homes Limited needs a property website that flips the usual model: instead of browsing listings, buyers and tenants post what they are looking for and sellers, landlords and agents come to them. Alongside this "reverse listing" marketplace, the site sells the company's own services — property management, property valuation and real estate agency.

The site has three jobs:

1. **Capture demand.** Make it fast for a buyer to describe the property they want (type, location, budget, size) and get matched.
2. **Connect supply.** Give sellers, landlords, developers and agents a searchable board of live buyer requests and a controlled way to respond with offers.
3. **Win service clients.** Generate qualified leads for property management, valuation and agency work.

A small showcase of Deems-managed properties can sit beside the request board, but the request board is the centre of the product. Reference site for content and service structure: [Myspace Properties](https://www.myspace.co.ke) (reviewed 15 Oct 2026).

## Decisions confirmed

The build is TypeScript end to end, delivered in two phases: a marketing website live around Nov 23, 2026, then the reverse listing web app.

| Topic | Decision |
| --- | --- |
| Tech stack | TypeScript throughout |
| Phasing | Phase 1 = website (2 weeks); Phase 2 = reverse listing web app |
| Launch | Website live around Nov 23, 2026 (moved from Oct 30, 2026) |
| Sign-in | Google only. Phase 1: staff admin panel only, limited to an approved list. Phase 2: everyone, with a required phone number that is not SMS-verified |
| Leads | Saved in the admin panel and emailed to an agent; CRM connected later |
| Hosting | Vercel with managed Postgres |
| Coverage | All 47 counties plus diaspora, with USD shown alongside KES |
| Board scope | Buy/sell **and** rent/let requests |
| Deals | Every deal goes through a Deems agent — buyers and sellers never deal directly |
| Revenue | Free marketplace first, then paid seller plans, plus commission on every closed deal |
| Content | Written and supplied in-house |
| Name | **Deems Luxe Homes Limited**, spelt as on the logo |

## Brand and visual identity

The logo's deep purple and golden yellow are the primary palette; everything else is neutral so the two brand colours stay distinctive. Note the logo reads **Deems Luxe** (with an "e") — the site, domain and copy should match it.

| Role | Colour | Approx. hex | Use |
| --- | --- | --- | --- |
| Primary | Deep purple | #4208BF | Header, primary buttons, headings, links |
| Accent | Golden yellow | #FDC902 | Highlights, badges ("Verified", "New request"), key calls to action on dark backgrounds |
| Dark | Near-black | #1A1530 | Body text, footer background |
| Light | Off-white | #FAF9FC | Page background |
| Neutral | Soft grey | #E6E3EE | Borders, cards, dividers |

- **Exact colours:** the hex values above are sampled from the attached image; confirm against the designer's source file before build.
- **Contrast:** yellow text on white fails accessibility contrast. Use yellow as a fill (with dark or purple text) or on purple/dark backgrounds only.
- **Logo files needed:** full logo (stacked), icon-only "DL" mark for favicon and app icon, and a white/reversed version for dark backgrounds — ideally SVG.
- **Typography:** a geometric sans-serif for headings echoing the logo's squared lettering, plus a highly readable sans for body text. Final choice to be agreed in design.
- **Tone:** premium but approachable — "luxe" without being exclusive, since the request board must welcome every budget.

## Users and roles

Four roles. Differences that used to be separate roles — private owner vs agency vs developer, agent vs admin — are now an **account type** or **permission level** inside a role, so no functionality is lost. One account can hold more than one role (e.g. a landlord who is also a management client).

| Role | Covers | Variants inside the role | What they can do |
| --- | --- | --- | --- |
| Seeker | Buyers and tenants — individuals, families, companies, diaspora | — | Post buy or rent requests, review the agent's shortlist, message their Deems agent, attend viewings, rate the experience |
| Seller | Owners, landlords, outside agents/agencies, developers | **Account type:** individual, agency or developer. Agency and developer accounts unlock an organisation profile, team members, registration verification (EARB for agencies) and, for developers, project pages with multiple units | Browse the board, save searches and alerts, keep properties in a locker, submit offers to the Deems agent, accept commission terms, subscribe to a plan when paid plans start |
| Service client | Owners wanting property management, valuation or agency services | — | Request quotes, track jobs, download valuation reports; management clients see statements and documents |
| Deems staff | Agents, valuers, property managers, managers, admins | **Permission level:** agent (own assigned requests and jobs), manager (assign work, see team reports), admin (users, content, settings, billing) | Own requests, curate offers, run viewings and deals, moderate, manage content and service jobs |

Guests (not signed in) can browse the request board and service pages but must register to post or respond.

## Reverse listing: how property requests work

A buyer or tenant posts a structured request and a Deems agent takes ownership of it. Sellers, landlords and outside agents respond with offers to the Deems agent, who screens them, presents a shortlist to the buyer, runs viewings and closes the deal. Buyer and seller never contact each other directly — that is what protects both sides and the commission.

### The flow

1. **Seeker posts a request** — to buy or to rent, via a guided form that takes under 2 minutes. They sign in with Google and give a phone number, which the agent confirms by calling.
2. **Agent assigned** — a Deems agent is assigned (by area or round-robin), checks the request is genuine and realistic, and publishes it.
3. **Request goes live** on the public board with the seeker anonymised — e.g. "3-bed apartment to rent, Kilimani, up to KES 120,000/month, from January".
4. **Matching alerts** go to sellers, landlords and outside agents whose saved searches match.
5. **Seller submits an offer** to the request: property details, photos, price or rent, documents available. The offer goes to the Deems agent, not the seeker.
6. **Agent curates** — rejects poor fits, asks sellers for missing details, checks documents, and publishes a shortlist to the seeker.
7. **Seeker reviews the shortlist** in their dashboard and messages the agent — compare, shortlist, decline with a reason.
8. **Viewings** are arranged by the agent with both sides. Seller contact details stay with Deems throughout.
9. **Deal** — agent negotiates, handles the offer letter or lease, and records the deal and commission. The seller accepts commission terms when submitting an offer.
10. **Close the loop** — request marked fulfilled or withdrawn; both sides rate the experience. Requests expire after a set period (e.g. 60 days) unless renewed.

### Request form fields

| Group | Fields |
| --- | --- |
| Intent | Buy or rent; residential, commercial or land |
| Property | Type (apartment, maisonette, bungalow, townhouse, villa, plot, office, shop, warehouse); bedrooms; bathrooms; size (sq ft or acres) |
| Location | County, area/estate (multi-select), or a radius on a map; flexibility (exact area vs nearby) |
| Budget | Min–max in KES (USD shown for diaspora); payment mode: cash, mortgage, instalments, off-plan |
| Must-haves | Parking, DSQ, garden, gated community, borehole, backup power, pet-friendly, furnished, etc. |
| Documents | Title deed required, sectional title, freehold vs leasehold |
| Timing | Move-in / purchase timeline; how long the request stays open |
| Notes | Free text and optional reference photos ("something like this") |

### Request board (supply side)

- Search and filter requests by location, type, budget band, timeline and posting date.
- Request cards show a **demand signal**: number of offers received, buyer verified badge (an agent has confirmed the request and phone number by call), budget band, days left.
- "Hot areas" and "most requested" views help sellers and developers see where demand is.
- Saved searches with instant or daily digest alerts.

### Privacy and anti-spam rules

- Seeker and seller contact details are never shared with each other; all communication runs through the assigned Deems agent.
- Sellers agree to commission terms before their first offer, so a deal cannot be taken off-platform without breaching them.
- Limits on offers per seller per day; repeat irrelevant offers lower the seller's standing.
- Report / block buttons on every request and offer.

## Site map and pages

Top navigation: **Home · Post a Request · Services · Featured Properties · About · Insights · Contact**, with a persistent "Post a Request" button in the brand yellow. Featured Properties only appears once a property is published. Phase 2 adds **Find Requests** and Sign in.

- **Home**
  - Hero: "Tell us what you're looking for and a Deems agent brings you vetted options" with a 3-field quick request (looking to buy/rent, area, budget) that opens the full form
  - How it works: 3 steps for buyers, 3 for sellers
  - Phase 2: latest requests carousel and live stats (requests posted, offers made, areas in demand), once there is real data to show
  - Services strip: management, valuation, agency
  - Featured properties (Deems-managed or agency listings)
  - Testimonials, partner/client logos, latest articles
  - Message from the CEO / director
- **Find Requests** — (Phase 2) public request board with filters and map view; request detail page
- **Post a Request** — Phase 1: a request form that sends the request straight to a Deems agent as a lead; Phase 2: full multi-step form tied to an account
- **Services** — overview page plus one page each for Property Management, Property Valuation and Real Estate Agency, each with its own quote form
- **Featured Properties** — curated showcase (not an open listings marketplace)
- **About** — story, team (with professional registration numbers), mission, office locations
- **Insights** — blog, buyer and seller guides, market reports
- **Contact** — form, phone, WhatsApp, map, office hours
- **Account dashboards** — Seeker, Seller/Agent, Service client, Admin
- **Legal** — Terms of use, Privacy policy, Cookie policy, FAQ; Community guidelines in Phase 2

## Feature requirements by area

Phase 1 is the website: everything a visitor needs to understand Deems, request a service or tell an agent what they want. Phase 2 is the web app: accounts, the public board, offers and dashboards.

| Area | Feature | Phase |
| --- | --- | --- |
| Pages | Home, Services (overview + 3 service pages), About, Featured Properties, Insights, Contact, FAQ, legal pages | 1 |
| Lead capture | "Post a Request" form (buy or rent, area, type, budget, timeline, contact) creating a lead for an agent | 1 |
| Lead capture | Quote forms for management, valuation and agency; email notification + CRM push | 1 |
| Content | CMS so the in-house team edits pages, featured properties and articles without a developer | 1 |
| General | Mobile-first design, WhatsApp button, cookie consent, analytics, SEO basics (sitemap, metadata, structured data) | 1 |
| Accounts | Register / sign in with Google, required phone number; roles | 2 |
| Accounts | Verification (ID, agent registration), "Verified" badge | 2 |
| Requests | Multi-step request form, drafts, edit, renew, close; agent assignment | 2 |
| Requests | Public board with filters, request detail pages, map view | 2 |
| Matching | Saved searches with email alerts; SMS / WhatsApp alerts | 2 |
| Offers | Seller offer submission with commission-terms acceptance | 2 |
| Offers | Agent curation queue; seeker shortlist dashboard | 2 |
| Communication | Messaging seeker ↔ agent and seller ↔ agent (never seeker ↔ seller) | 2 |
| Deals | Viewing scheduling, deal record, commission tracking | 2 |
| Revenue | Seller plans and M-Pesa / card billing (switched on after the free period) | 2 |
| Trust | Ratings, reviews, report / block | 2 |
| Seller tools | Property locker to reuse properties across offers; demand insights | 2 |
| Tools | Mortgage / affordability and rent-affordability calculators | 2 |
| Admin | Moderation, agent workload, reports on requests, offers, deals, commission | 2 |

## Data models

Phase 1 needs only content collections and two lead types; Phase 2 adds the marketplace. The Phase 1 request lead uses the same fields as the Phase 2 `PropertyRequest`, so every request captured from launch day migrates straight onto the board.

### Phase 1 — website

```typescript
// Shared value types (reused in Phase 2)
type Intent = "buy" | "rent";
type Category = "residential" | "commercial" | "land";
type PropertyType =
  | "apartment" | "maisonette" | "bungalow" | "townhouse" | "villa"
  | "plot" | "office" | "shop" | "warehouse";
type Money = { amount: number; currency: "KES" | "USD" };
type Budget = { min?: Money; max: Money; period?: "total" | "monthly" }; // monthly for rentals

interface RequestCriteria {
  intent: Intent;
  category: Category;
  propertyTypes: PropertyType[];
  bedrooms?: { min: number; max?: number };
  bathrooms?: number;
  locations: { county: string; areas: string[] };
  budget: Budget;
  paymentMode?: "cash" | "mortgage" | "instalments" | "off_plan";
  mustHaves: string[];          // "parking", "dsq", "borehole", "furnished"...
  titleRequirement?: "title_deed" | "sectional_title" | "any";
  timeline: "immediate" | "1_3_months" | "3_6_months" | "6_plus_months";
  notes?: string;
}

// Lead from the "Post a Request" form
interface RequestLead {
  id: string;
  criteria: RequestCriteria;
  contact: { name: string; phone: string; email?: string; whatsapp: boolean };
  consentAt: Date;              // Data Protection Act consent
  source: "website" | "whatsapp" | "phone" | "walk_in";
  status: "new" | "contacted" | "qualified" | "closed";
  assignedAgentId?: string;
  crmId?: string;               // ID in the CRM once pushed
  createdAt: Date;
}

// Lead from a service quote form
interface ServiceLead {
  id: string;
  service: "management" | "valuation" | "agency";
  details: Record<string, unknown>; // service-specific answers
  contact: { name: string; phone: string; email?: string };
  attachments: string[];        // Media ids (title copy, photos)
  consentAt: Date;
  status: "new" | "quoted" | "won" | "lost";
  crmId?: string;
  createdAt: Date;
}

// CMS content
interface FeaturedProperty {
  id: string; slug: string; title: string;
  intent: Intent; propertyType: PropertyType;
  location: { county: string; area: string };
  price?: Money; priceOnRequest: boolean;
  bedrooms?: number; bathrooms?: number; sizeSqFt?: number;
  description: string; features: string[];
  gallery: string[];            // Media ids
  status: "available" | "under_offer" | "sold" | "let";
  published: boolean;
}
interface Article { id: string; slug: string; title: string; excerpt: string; body: unknown; coverImage: string; authorId: string; tags: string[]; publishedAt?: Date; seo: Seo }
interface TeamMember { id: string; name: string; role: string; bio: string; photo: string; registration?: { body: "EARB" | "VRB"; number: string } }
interface Testimonial { id: string; quote: string; name: string; context: string; approved: boolean }
interface Partner { id: string; name: string; logo: string; url?: string }
interface Media { id: string; url: string; alt: string; width: number; height: number }
interface Seo { title?: string; description?: string; image?: string }
```

### Phase 2 — web app

```typescript
type Role = "seeker" | "seller" | "service_client" | "staff";
type SellerType = "individual" | "agency" | "developer";
type StaffLevel = "agent" | "manager" | "admin";

interface User {
  id: string; name: string; phone: string; email?: string;
  roles: Role[];                // one account can hold several roles
  sellerType?: SellerType;      // set when roles includes "seller"
  staffLevel?: StaffLevel;      // set when roles includes "staff"
  organizationId?: string;      // agency or developer
  verification: { status: "none" | "pending" | "verified" | "rejected"; documents: string[]; verifiedAt?: Date };
  planId?: string;              // seller plan, once paid plans start
  createdAt: Date;
}
interface Organization { id: string; name: string; type: "agency" | "developer"; earbNumber?: string; logo?: string; members: string[] }

interface PropertyRequest {
  id: string;
  seekerId: string;
  criteria: RequestCriteria;    // same shape as Phase 1
  assignedAgentId: string;      // always a staff user
  status: "draft" | "pending_review" | "live" | "fulfilled" | "withdrawn" | "expired";
  publicSummary: string;        // anonymised text shown on the board
  expiresAt: Date;
  offerCount: number;
  migratedFromLeadId?: string;
  createdAt: Date;
}

interface Property {             // seller's "locker", reusable across offers
  id: string; ownerId: string;
  intent: Intent; propertyType: PropertyType;
  location: { county: string; area: string; lat?: number; lng?: number };
  bedrooms?: number; bathrooms?: number; sizeSqFt?: number;
  features: string[]; gallery: string[];
  documents: { type: "title_deed" | "search" | "approval" | "other"; mediaId: string }[];
}

interface Offer {
  id: string; requestId: string; sellerId: string; propertyId: string;
  price: Money; period?: "total" | "monthly";
  pitch: string;
  commissionTermsAcceptedAt: Date;
  status: "submitted" | "needs_info" | "rejected" | "shortlisted" | "declined_by_seeker" | "viewing" | "won";
  agentNotes?: string;          // internal, never shown to seeker or seller
  createdAt: Date;
}

interface Conversation {         // always includes the Deems agent
  id: string; requestId: string;
  participants: string[];       // [agent, seeker] or [agent, seller]
  kind: "agent_seeker" | "agent_seller";
}
interface Message { id: string; conversationId: string; senderId: string; body: string; attachments: string[]; sentAt: Date; readAt?: Date }

interface Viewing { id: string; offerId: string; scheduledFor: Date; status: "proposed" | "confirmed" | "done" | "cancelled"; feedback?: string }

interface Deal {
  id: string; requestId: string; offerId: string; agentId: string;
  type: "sale" | "letting";
  agreedPrice: Money;
  stage: "negotiation" | "offer_letter" | "agreement" | "completion" | "fallen_through";
  commission: { basis: "percent" | "fixed" | "months_rent"; rate: number; amount: Money; payer: "seller" | "seeker" | "both"; status: "due" | "invoiced" | "paid" };
  closedAt?: Date;
}

interface SellerPlan { id: string; name: string; price: Money; interval: "month" | "year"; limits: { offersPerMonth: number; savedSearches: number; featuredOffers: number } }
interface Subscription { id: string; userId: string; planId: string; status: "trial" | "active" | "past_due" | "cancelled"; currentPeriodEnd: Date }
interface Payment { id: string; userId: string; amount: Money; method: "mpesa" | "card"; reference: string; purpose: "subscription" | "commission" | "featured"; status: "pending" | "paid" | "failed"; paidAt?: Date }

interface SavedSearch { id: string; userId: string; criteria: Partial<RequestCriteria>; channels: ("email" | "sms" | "whatsapp")[]; frequency: "instant" | "daily" }
interface Review { id: string; dealId: string; authorId: string; subjectId: string; rating: 1 | 2 | 3 | 4 | 5; comment?: string }
interface AuditLog { id: string; actorId: string; action: string; entity: string; entityId: string; at: Date }
```

Key relationships: a `PropertyRequest` has many `Offer`s; each `Offer` points to one `Property`; a won offer becomes one `Deal`; every `Conversation` belongs to a request and always includes its assigned Deems agent.

## Services

Each service gets its own page with what's included, who it's for, the process, credentials, FAQs and a quote form that creates a lead for staff.

### Property Management

- **Included:** marketing vacant units, tenant screening and placement, lease preparation, rent collection, arrears follow-up, maintenance and repairs coordination, periodic inspections, monthly owner statements.
- **Quote form:** property type, location, number of units, current occupancy, services wanted.
- **Website tie-in:** vacant managed units can be offered directly against matching rental requests on the board.

### Property Valuation

- **Included:** valuations for sale or purchase, mortgage/bank, insurance, probate and estate planning, rent reviews, and land.
- **Quote form:** purpose of valuation, property type, location, size, title type, urgency; upload of title or site photos.
- **Credibility:** list the registered valuer(s) and registration numbers; name the banks or lenders that accept the reports, if any.

### Real Estate Agency

- **For sellers/landlords:** pricing advice, marketing, responding to buyer requests on their behalf, negotiation, transaction support through to transfer.
- **For buyers:** a "Let Deems find it for you" upgrade on any request — an agent actively sources properties, vets documents and accompanies viewings.
- **Quote form:** buy, sell, let or rent; property details; timeline.

The agency service is the bridge between the free marketplace and paid work: any buyer or seller on the board should be one click from handing the job to a Deems agent.

## Revenue model

Commission on closed deals is the main income from day one; seller plans are added once the board has enough requests that sellers will pay for access.

| Stage | What sellers pay | What Deems earns | Switch-over trigger |
| --- | --- | --- | --- |
| 1. Free marketplace | Nothing to browse or make offers | Commission on every deal closed by a Deems agent | — |
| 2. Paid seller plans | Monthly or annual plan; free tier keeps a small monthly offer allowance | Plan fees + commission | A demand threshold to agree, e.g. a steady number of live requests per month |
| Add-ons (later) | Featured offers, priority alerts | Per-use fees | After plans are stable |

- **Commission is enforceable** because every deal runs through a Deems agent and sellers accept commission terms before their first offer.
- **Rates still to set:** sale commission (%), letting commission (e.g. a share of first month's rent), who pays (seller, seeker or both), and plan prices.
- **Grandfathering:** give early free-stage sellers a discount when plans start, to avoid losing supply at the switch.

## Content plan

The Myspace Properties site is a useful pattern for service and company content: a short CEO welcome, four service blocks each with a short description and "Read more", partner logos as social proof, two office locations in the footer, and a blog. It is also a reminder of what to avoid — leftover template filler text and sections with no content undermine trust. Every section on the Deems site should launch with real content or not launch.

| Content | Owner | Notes |
| --- | --- | --- |
| Homepage copy and hero headline | Deems + writer | Lead with the reverse listing promise, not generic "find your dream home" |
| How it works (buyers and sellers) | Writer | Short, illustrated, 3 steps each |
| Service pages (3) | Deems + writer | Real scope, process, credentials |
| About, team bios, photos | Deems | Professional headshots; registration numbers |
| CEO / director message | Deems | Short and personal |
| Featured properties | Deems | Real photos, prices or "Price on request" |
| Testimonials and partner logos | Deems | Only with permission |
| Launch articles (5–8) | Writer | e.g. how reverse listing works, buying land safely in Kenya, title deed checks, valuation explained, diaspora buying guide |
| FAQ, terms, privacy policy | Deems + lawyer | Must cover data use and request visibility |
| Seed requests for launch | Deems | So the board isn't empty on day one |

## Technical and integration options

The stack is TypeScript throughout. The proposal below uses one codebase for both phases: the Phase 1 CMS becomes the Phase 2 back end and admin panel, so nothing is thrown away.

| Layer | Proposed | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Fast, SEO-friendly pages for Phase 1; the same app grows into the web app |
| Styling | Tailwind CSS with brand colours as design tokens | Quick to build, consistent with the palette |
| CMS / back end | Payload CMS (TypeScript, runs inside the Next.js app) | In-house team edits content in Phase 1; its collections, auth and access control carry Phase 2 |
| Database | PostgreSQL (managed) | Relational data suits requests → offers → deals |
| Validation | Zod, shared between forms and server | One definition of `RequestCriteria` for both phases |
| Email | Transactional email service | Lead notifications to agents, confirmations to visitors |
| Hosting | Vercel or a VPS, plus object storage for images | Decide on budget and data-location preference |
| Testing | Playwright (end-to-end + screenshots) | Also powers the design feedback loop below |

Phase 2 additions: public Google sign-in, background jobs for alerts, M-Pesa (Daraja) and card billing, SMS and WhatsApp messaging.

### Integrations to plan for

- **CRM:** service leads, request leads and agent sign-ups pushed to a CRM (e.g. Zoho CRM) so sales follows up from one place.
- **Payments:** M-Pesa (Daraja API) and card payments, if seller plans, credits or featured placements are charged.
- **Messaging:** SMS (e.g. Africa's Talking), WhatsApp Business API for alerts, transactional email service.
- **Maps:** Google Maps or Mapbox for area selection and the map view.
- **Media:** image storage with automatic resizing and compression; optional video and virtual tour embeds.
- **Analytics:** Google Analytics 4 / Tag Manager, Meta Pixel for ad campaigns.

### Non-functional requirements

- Pages load in under 3 seconds on a mid-range phone on 4G.
- HTTPS, daily backups, role-based admin access, audit log of moderation actions.
- Accessible (WCAG 2.1 AA target), including the colour contrast rule in the brand section.
- Built so the same back end can later serve a mobile app.

## Building with Claude Code on WSL

The most reliable setup is: approved design images in the repo, Playwright running headless inside WSL to screenshot the local site, and a written rule in `CLAUDE.md` that makes Claude compare its screenshot against the design and fix differences before calling a page done.

### 1. Get a design to build against

Claude matches a picture far better than a description. Pick one source:

| Option | How | Best when |
| --- | --- | --- |
| Claude Design (in the Claude app) | Generate Home, a service page and the request form with the logo and palette; iterate; export PNGs | Fastest for a 2-week launch with no designer |
| Figma | Designer works in Figma; connect Figma's MCP server to Claude Code so it reads frames directly | You have, or will hire, a designer |
| Reference sites + brief | Screenshot 2–3 sites whose layout you like, plus a written style brief | Quick start, but expect more back-and-forth |

Save each approved screen as `design/<page>-desktop.png` and `design/<page>-mobile.png` (1440 px and 375 px wide).

### 2. Set up WSL once

- Keep the repo in the Linux file system (e.g. `~/projects/deems-luxe`), not under `/mnt/c` — file watching and builds are much faster.
- Install Node LTS (via nvm) and pnpm inside WSL, then Claude Code.
- Install Playwright's browser and its Linux dependencies: `npx playwright install --with-deps chromium`. It runs headless, so no Windows display setup is needed.
- Add the Playwright MCP server so Claude can open pages and take screenshots itself: `claude mcp add playwright -- npx @playwright/mcp@latest`.
- Add a screenshot script as a dependable fallback: `pnpm shot <route>` saves desktop and mobile PNGs of `localhost:3000/<route>` to `screenshots/`, which Claude opens with its file reader.
- To show Claude your own screenshots, save them in the repo and mention the path (e.g. `@design/home-desktop.png`) — more reliable than clipboard paste across WSL.

### 3. Write `CLAUDE.md` first

Include: the stack, folder structure, brand tokens (hex values, fonts, spacing scale), the data models above, and the loop rule:

> After any UI change: run `pnpm shot <route>`, open the screenshots and the matching `design/` images, list every visible difference (layout, spacing, type size, colour, alignment), fix them, and repeat — up to 3 rounds. Then report what still differs.

### 4. Build loop per page

1. Start in plan mode: Claude proposes components and structure for the page; you approve.
2. Tokens and shared components first (header, footer, buttons, cards, form fields), then pages one at a time.
3. Claude implements → screenshots desktop and mobile → compares with the design → fixes.
4. You review the final screenshot; give precise feedback ("hero headline 48 px, buttons 12 px radius") rather than "make it nicer".
5. Commit each approved page, then start a fresh session for the next page to keep context clean.
6. Once a page is signed off, add a Playwright visual test (`toHaveScreenshot`) so later changes can't silently break it.

### Practices that save time

- Mobile screenshot first — most Kenyan visitors will be on phones.
- One page or component per request; large "build the whole site" prompts drift from the design.
- Use real content early; placeholder text hides layout problems.
- Let Claude write tests for the forms (validation, lead creation, CRM push) — those are the parts that must not fail at launch.

## Trust, safety, legal and compliance

Property fraud is a real risk in Kenya, so trust features are part of the product, not an add-on. Legal points below need confirmation by the client's lawyer.

- **Data protection:** the site collects personal data (names, phones, IDs, budgets), so it must comply with Kenya's Data Protection Act, 2019 — clear consent, a privacy policy, data-subject rights, and registration with the Office of the Data Protection Commissioner if required for the business.
- **Professional registration:** display Estate Agents Registration Board registration for agency work and Valuers Registration Board registration for valuers; verify third-party agents' registration before giving them a "Verified agent" badge.
- **Seller verification:** ID check for all responders; optional title document upload with a "Documents provided" badge (not a guarantee of title).
- **Fraud warnings:** visible guidance — never pay deposits before an official search, never pay to personal accounts, use an advocate for transfers.
- **Moderation:** community guidelines, report/block, admin review of flagged content, and the ability to suspend accounts.
- **Disclaimers:** Deems acts as agent on every deal; terms must state whom the agent represents, the commission terms sellers accept, and that third-party offers are not guaranteed until Deems has verified them.

## Suggested phasing

Phase 1 (the website) launches around Nov 23, 2026; the biggest risk to that date is content, so copy review and legal text are due by Nov 18, 2026.

### Phase 1 — website (2 weeks)

1. **Mon 9 – Tue 10 Nov:** repo, tooling, `CLAUDE.md`, brand tokens, Google sign-in for staff, shared components.
2. **Wed 11 – Thu 12 Nov:** homepage design rounds and sign-off.
3. **Fri 13 – Mon 16 Nov:** Services (×3), About, Contact, Post a Request and quote forms with lead storage and agent email.
4. **Tue 17 – Wed 18 Nov:** Featured Properties, Insights, FAQ, legal pages; copy loaded and reviewed.
5. **Thu 19 Nov:** SEO, analytics, cookie consent, accessibility and speed checks; CMS training for staff.
6. **Fri 20 Nov:** domain, DNS, SSL, production deploy, final test of every form.
7. **Mon 23 Nov:** launch.

### Phase 2 — web app

Accounts and verification, the public board, offers and agent curation, messaging, viewings, deals and commission tracking, alerts, then paid seller plans when the demand trigger is met. Requests captured as leads in Phase 1 are migrated onto the board at Phase 2 launch. Timeline to be estimated after Phase 1 ships.

## Open questions to confirm with the client

Decisions made on 16 Oct are recorded under Decisions confirmed. These remain open.

- [ ] **Commission rates:** sale % and letting fee, and who pays (seller, seeker or both).
- [ ] **Paid-plan trigger and pricing:** what level of demand switches on seller plans, and at what price.
- [ ] **Who can respond:** any owner, or only verified agents and developers?
- [ ] **Agent assignment:** by area, round-robin, or manual by a manager — and how many Deems agents at launch?
- [ ] **CRM:** which CRM receives leads (e.g. Zoho CRM), and is it already set up?
- [ ] **Coverage:** Nairobi only at launch, all of Kenya, or diaspora buyers as a target segment?
- [ ] **Existing assets:** domain, hosting, social accounts, source logo files (SVG)?
- [ ] **Professional credentials:** which registrations (EARB, VRB) does the company hold today?
- [ ] **Design source:** Claude Design, a Figma designer, or reference sites?
