# SEO Improvement — Quiniela Mundial

**Date:** 2026-04-26
**Approach:** Option B — Surgical fixes + Homepage SSR

---

## Context

Quiniela Mundial is a Next.js App Router app for predicting FIFA World Cup 2026 match scores. The app already has baseline SEO (title templates, robots.txt, sitemap, JSON-LD, per-page metadata), but has several gaps that prevent full search-engine visibility and social sharing.

---

## Goals

1. Social sharing previews work correctly (OG/Twitter images)
2. Google indexes meaningful HTML from the homepage without executing JS
3. All public pages have metadata (title, description, canonical)
4. PWA icons work on iOS and Android
5. No layout shift from flag images on match detail pages
6. Sitemap `lastModified` values are accurate

---

## Design

### 1. Open Graph Image + PWA Icons

**Files to create:**
- `src/app/opengraph-image.tsx` — Next.js `ImageResponse`, 1200×630px
  - Background: `#111111` (neutral-900)
  - Title: "Quiniela Mundial" (white, large)
  - Subtitle: "Mundial 2026 · USA · México · Canadá" (neutral-400, smaller)
  - Auto-served as `og:image` and `twitter:image` for all pages by Next.js
- `src/app/icon.tsx` — `ImageResponse` 32×32, serves as favicon
- `src/app/apple-icon.tsx` — `ImageResponse` 180×180, serves as apple-touch-icon

**Files to update:**
- `src/app/manifest.ts` — add `{ src: "/icon", sizes: "32x32" }` and `{ src: "/apple-icon", sizes: "180x180" }` to icons array

**No per-page OG images.** Static brand image is sufficient for this use case.

---

### 2. Homepage: SSR Refactor

**Problem:** `src/app/page.tsx` is `"use client"`, so Google sees near-empty HTML on first load.

**Solution:** Split into server + client:

**`src/app/page.tsx`** — becomes a Server Component:
- Removes `"use client"` directive
- Renders the full hero layout: H1, subtitle, countdown slot, info text, CTA buttons
- Imports and renders `<CountdownTimer />` as a child
- Keeps all Tailwind classes and structure identical
- No `useEffect`, no GSAP at this level

**`src/components/countdown-timer.tsx`** — new Client Component:
- Contains `"use client"` directive
- Extracts: `useSyncExternalStore` countdown logic, GSAP animations for countdown cards and container pulse
- Receives no props (self-contained)
- Renders only the countdown card `<div>` (the dark rounded box with days/hours/min/sec)
- The parent page handles all other animations via CSS (or they can be dropped — the H1/subtitle/buttons will be visible immediately via SSR)

**Animation strategy:** GSAP animations on the H1, subtitle, and buttons are optional for the SSR version — they are purely cosmetic and run only after hydration. They can remain in `CountdownTimer` context or be simplified to CSS `@keyframes` on the server-rendered elements. The key requirement is that the text is present in the HTML.

---

### 3. Metadata, Canonicals, and CLS

**Canonical URLs:**
- Add `alternates: { canonical: siteUrl }` to `layout.tsx` root metadata
- Add `alternates: { canonical: \`${siteUrl}/matches\` }` to matches page metadata
- Add `alternates: { canonical: \`${siteUrl}/leaderboard\` }` to leaderboard page metadata
- Add canonical to `generateMetadata` in `matches/[matchId]/page.tsx`

**Metadata for `/rules` (client component):**
- Create `src/app/rules/layout.tsx` — Server Component that exports:
  ```ts
  export const metadata: Metadata = {
    title: "Reglas",
    description: "Conoce el sistema de puntuacion de la quiniela. Ganas 5 puntos por marcador exacto, 3 por ganador correcto y 2 por empate correcto.",
    alternates: { canonical: `${siteUrl}/rules` },
  };
  ```

**Metadata for `/sign-in` (client component):**
- Create `src/app/sign-in/layout.tsx` — Server Component that exports:
  ```ts
  export const metadata: Metadata = {
    title: "Iniciar sesión",
    description: "Accede a tu cuenta de Quiniela Mundial para hacer tus predicciones del Mundial 2026.",
    robots: { index: false },
    alternates: { canonical: `${siteUrl}/sign-in` },
  };
  ```

**CLS fix in `matches/[matchId]/page.tsx`:**
- Replace `<img src={flagUrl} alt={code} className="w-12 h-9 ...">` (×2, home + away teams) with Next.js `<Image src={flagUrl} alt={name} width={48} height={36} className="..." />`
- Add `import Image from "next/image"` at top of file
- Eliminates layout shift and enables Next.js image optimization

**Sitemap `lastModified` fix in `src/app/sitemap.ts`:**
- `/` → `new Date()` (homepage content changes with matches)
- `/matches` → `new Date()` (match data changes daily)
- `/leaderboard` → `new Date()` (scores update frequently)
- `/rules` → `new Date("2025-01-01")` (static content, rarely changes)
- `/sign-in` → `new Date("2025-01-01")` (static content)

---

## Files Created

| File | Action |
|------|--------|
| `src/app/opengraph-image.tsx` | Create |
| `src/app/icon.tsx` | Create |
| `src/app/apple-icon.tsx` | Create |
| `src/components/countdown-timer.tsx` | Create |
| `src/app/rules/layout.tsx` | Create |
| `src/app/sign-in/layout.tsx` | Create |

## Files Modified

| File | Change |
|------|--------|
| `src/app/page.tsx` | Remove `"use client"`, extract countdown to component, add SSR structure |
| `src/app/manifest.ts` | Add PNG icon entries |
| `src/app/layout.tsx` | Add canonical URL to root metadata |
| `src/app/matches/page.tsx` | Add canonical URL |
| `src/app/leaderboard/page.tsx` | Add canonical URL |
| `src/app/matches/[matchId]/page.tsx` | Add canonical, replace `<img>` with `<Image>` |
| `src/app/sitemap.ts` | Fix `lastModified` dates for static pages |

---

## Out of Scope

- Per-page dynamic OG images (static brand image is sufficient)
- JSON-LD schema per page (current WebApplication + SportsEvent is adequate)
- hreflang tags (single-language app)
- Performance profiling / Core Web Vitals audit beyond CLS fix
