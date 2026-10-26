# Jhaubon — immersive resort site with bookings

A bilingual (English / বাংলা) resort website where guests walk through real 3D captures (Gaussian splats) of the rooms, then book with a bKash, Nagad or Rocket advance, a bank transfer, or pay at the hotel. The front desk manages bookings, rates, content and payment settings in `/admin`.

Next.js 16 · React 19 · TypeScript · Tailwind 4 · PlayCanvas (`playcanvas` + `@playcanvas/react`) · Prisma 7 + PostgreSQL · TanStack Query · Zod · shadcn-style Radix components.

> The resort name, prices, facts and Bengali copy are placeholders. Have a native speaker review `src/i18n/index.ts`.

## First run

```bash
cp .env.example .env            # fill in DATABASE_URL, AUTH_SECRET, SEED_ADMIN_*
npm install                     # also runs prisma generate
npm run db:migrate -- --name init   # creates prisma/migrations/… and the tables
npm run db:seed                 # 4 spaces, settings, first admin user
npm run dev                     # http://localhost:3000 → /en or /bn
```

Sign in at `/admin/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Commit the generated `prisma/migrations` folder.

## Deploying on Vercel

1. Create a Postgres database (Neon, Supabase or Vercel Postgres) and use its **pooled** connection string as `DATABASE_URL`.
2. Set `DATABASE_URL` and `AUTH_SECRET` (at least 32 characters: `openssl rand -base64 48`) in the Vercel project.
3. Vercel runs `npm run vercel-build`, which applies migrations (`prisma migrate deploy`) and builds.
4. Run `npm run db:seed` once against the production database from your machine to create the admin user.
5. A client site needs Vercel's Pro plan; Hobby is for non-commercial use.

## How it works

### Languages
- Every public page lives under `/en/…` or `/bn/…`. A visitor without a locale in the URL goes to `/bn` if their browser prefers Bengali, otherwise `/en`, and the language switch remembers their choice in a cookie (`src/proxy.ts`).
- UI text is in `src/i18n/index.ts`. Room and space text lives in the database as `…En` / `…Bn` columns, edited side by side in admin.
- Prices and dates use `bn-BD` formatting in Bengali: Bengali digits and lakh grouping (১৮,৪৬,৬০০৳).
- Bengali text uses Noto Serif Bengali (headings) and Hind Siliguri (body), self-hosted.

### Booking (Bangladesh setup)
- **Price** (`src/lib/pricing.ts`): nightly rate, with a weekend rate on chosen nights (default Thursday and Friday nights, since the weekend is Friday–Saturday), then service charge, then VAT on room + service charge, then the advance. All percentages are editable under **Payments & tax**. Hotel VAT depends on the property's category and changes with the budget; confirm the rates and the VAT base with the resort's accountant.
- **Availability**: each suite type has a number of rooms. A booking takes a Postgres advisory lock for that suite before counting overlapping bookings, so two guests can't both get the last room. Pending, confirmed and checked-in bookings hold a room; cancelled and checked-out ones free it.
- **Phone numbers**: Bangladeshi mobiles only (`01[3-9]` + 8 digits, with or without +88), in English or Bengali digits, stored as `+8801…`.
- **Payment**: guests choose bKash, Nagad, Rocket, bank transfer or pay at the hotel. A wallet only appears once its number is set in admin. Mobile-banking guests send the advance, quote their booking reference, and enter the TrxID; the front desk checks it in the merchant app and clicks **Mark received & confirm**.
- Amounts are saved on each booking, so later rate or tax changes don't alter existing bookings.

### Admin (`/admin`)
- **Bookings**: today's arrivals, payments to verify, pending confirmations, guests in house; filters; search by reference, name, phone or TrxID; per-booking status, payment status and notes.
- **Spaces & rates** (owner only): bilingual text, weekday/weekend rates, rooms, max guests, publish/bookable switches, and the 3D settings (splat URL, poster, camera poses, tour stops, credit). Saving refreshes the public pages in both languages.
- **Payments & tax** (owner only): wallet numbers, bank details, VAT, service charge, advance %, weekend nights, hotline, check-in/out times.
- Roles: `OWNER` sees everything; `FRONT_DESK` sees bookings only. Add staff users with Prisma Studio (`npx prisma studio`) and a bcrypt hash, or extend the seed.

### Not done yet
- **SMS**: `src/lib/notify.ts` is the hook for a Bangladeshi SMS gateway; until it's wired up, new bookings only appear in admin.
- **Automatic payment gateways** (bKash Checkout, SSLCommerz) need merchant API credentials. They'd slot in as another payment method next to the manual TrxID flow.
- **Media uploads**: splat and poster files are referenced by URL. Host them on object storage such as Cloudflare R2 (no egress fees) rather than in `public/`.

## Adding a 3D capture
1. Capture the space (Postshot, Polycam, Luma) or download a **CC BY** scene from SuperSplat Explore (avoid NC licences on a commercial site).
2. Convert it to `.sog` with PlayCanvas splat-transform and upload it.
3. In **Spaces & rates**, set the splat URL, a start pose, tour stops and the credit. Until a splat URL is set, the space shows a "3D walkthrough on its way" page.

## Gotchas
- **`<GSplat unified />` is required**: `@playcanvas/react` 0.11 defaults `unified` to `false`, a deprecated path that draws nothing with PlayCanvas engine 2.23.
- **Splat rotation depends on the source**: a `.sog` rebuilt from a SuperSplat scene needs `[0, 0, 180]`, and a raw `.ply` capture usually needs `[180, 0, 0]` (the default). `splat-transform … out.webp --camera-pos … --camera-target …` renders in the same frame as `[0, 0, 180]`, so you can pick poses and render posters with it.
- **`cacheComponents` is off** in `next.config.ts`; TanStack Query reads `Date.now()` during prerender, which fails the build when it's on.
- **Revalidating localized pages**: use the route pattern, `revalidatePath("/[locale]", "layout")`. `revalidatePath("/en")` doesn't refresh a dynamic segment.
- Without WebGL 2 the viewer shows the poster photo with a note instead of failing; reduced-motion users get jumps instead of camera flights.

## Credits (required by the licence)
- "SA3D_R&D_XP47" by Stephane Agullo (sa3d.fr), CC BY 4.0, https://superspl.at/view?id=cdcec084, shown as the Wisteria Garden Suite. `public/posters/garden-suite.webp` is a render of this capture. The credit is shown in the site footer and the suite's details panel; keep it there.
- "Theas Dining Hall" by saintnyakweba, CC BY 4.0, https://superspl.at/view?id=30ae3d93, shown as the Gathering Hall.
- "Manica SkyView Hotel pool" by jindantesparda, CC BY 4.0, https://superspl.at/view?id=a40705be, shown as the Casuarina Pool.
- "Modlinek Villa 01-bathroom" by andriishramko, CC BY 4.0, https://superspl.at/view?id=131874fa, shown as the Suite Bathroom.
- These three were changed: decimated to 0.8–0.9M splats, reduced to base colour (no spherical harmonics) and re-encoded as `.sog` with splat-transform 3.10. Their posters in `public/posters/` are renders of the converted files.
- Fonts: Newsreader, Hanken Grotesk, Noto Serif Bengali, Hind Siliguri (SIL Open Font License), via Fontsource.
