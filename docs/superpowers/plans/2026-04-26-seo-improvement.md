# SEO Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all SEO gaps in Quiniela Mundial: OG images, PWA icons, homepage SSR, canonical URLs, metadata on all public pages, and CLS fix on match detail.

**Architecture:** Five independent tasks that touch different files — can be executed in parallel. No shared state between tasks. Each task results in a commit.

**Tech Stack:** Next.js 15 App Router, TypeScript, `next/og` (ImageResponse), Tailwind CSS, Prisma, Vitest

**Spec:** `docs/superpowers/specs/2026-04-26-seo-improvement-design.md`

---

## File Map

| File | Task | Action |
|------|------|--------|
| `src/app/opengraph-image.tsx` | 1 | Create |
| `src/app/icon.tsx` | 1 | Create |
| `src/app/apple-icon.tsx` | 1 | Create |
| `src/app/manifest.ts` | 1 | Modify |
| `src/app/sitemap.ts` | 2 | Modify |
| `src/app/layout.tsx` | 3 | Modify |
| `src/app/matches/page.tsx` | 3 | Modify |
| `src/app/leaderboard/page.tsx` | 3 | Modify |
| `src/app/rules/layout.tsx` | 3 | Create |
| `src/app/sign-in/layout.tsx` | 3 | Create |
| `src/components/countdown-timer.tsx` | 4 | Create |
| `src/app/page.tsx` | 4 | Modify |
| `src/app/matches/[matchId]/page.tsx` | 5 | Modify |
| `next.config.ts` | 5 | Modify |

---

## Task 1: OG Image + PWA Icons

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Create: `src/app/icon.tsx`
- Create: `src/app/apple-icon.tsx`
- Modify: `src/app/manifest.ts`

- [ ] **Step 1: Create the OG image**

Create `src/app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Quiniela Mundial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 80,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-2px",
          }}
        >
          Quiniela Mundial
        </p>
        <p
          style={{
            color: "#a3a3a3",
            fontSize: 36,
            margin: 0,
          }}
        >
          Mundial 2026 · USA · México · Canadá
        </p>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Create the favicon icon**

Create `src/app/icon.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
        }}
      >
        <span style={{ color: "white", fontSize: 20, fontWeight: 700 }}>Q</span>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Create the Apple touch icon**

Create `src/app/apple-icon.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "22px",
        }}
      >
        <span style={{ color: "white", fontSize: 110, fontWeight: 700 }}>Q</span>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 4: Update manifest.ts to include the new icons**

Open `src/app/manifest.ts`. Replace the `icons` array so it reads:

```ts
icons: [
  {
    src: "/favicon.ico",
    sizes: "any",
    type: "image/x-icon",
  },
  {
    src: "/icon",
    sizes: "32x32",
    type: "image/png",
  },
  {
    src: "/apple-icon",
    sizes: "180x180",
    type: "image/png",
  },
],
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors, no build failures. The `opengraph-image`, `icon`, and `apple-icon` routes should appear in the build output.

- [ ] **Step 6: Commit**

```bash
git add src/app/opengraph-image.tsx src/app/icon.tsx src/app/apple-icon.tsx src/app/manifest.ts
git commit -m "feat(seo): add OG image, favicon icon, and apple-touch-icon"
```

---

## Task 2: Sitemap `lastModified` Fix

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Fix lastModified dates for static pages**

Open `src/app/sitemap.ts`. Replace the `staticPages` array with:

```ts
const staticPages: MetadataRoute.Sitemap = [
  {
    url: siteUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${siteUrl}/matches`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/leaderboard`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/rules`,
    lastModified: new Date("2025-01-01"),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${siteUrl}/sign-in`,
    lastModified: new Date("2025-01-01"),
    changeFrequency: "monthly",
    priority: 0.4,
  },
];
```

The only change is `lastModified` for `/rules` and `/sign-in` — they use a fixed past date since their content rarely changes. Also reduce `/sign-in` priority from 0.5 to 0.4 (it's a utility page, not a discovery page).

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | grep -E "sitemap|error|Error" | head -10
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "fix(seo): use fixed lastModified dates for static pages in sitemap"
```

---

## Task 3: Canonical URLs + Missing Page Metadata

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/matches/page.tsx`
- Modify: `src/app/leaderboard/page.tsx`
- Create: `src/app/rules/layout.tsx`
- Create: `src/app/sign-in/layout.tsx`

- [ ] **Step 1: Add canonical to root layout metadata**

Open `src/app/layout.tsx`. The `siteUrl` variable is already defined at line 19. Inside the `metadata` export object (after line 57, before the closing `}`), add the `alternates` field:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quiniela Mundial — Predice los resultados",
    template: "%s | Quiniela Mundial",
  },
  description:
    "Participa en la quiniela del Mundial de Futbol 2026. Predice marcadores de los 104 partidos, compite contra amigos y escala en el ranking. USA, Mexico y Canada.",
  keywords: [
    "quiniela",
    "mundial 2026",
    "predicciones futbol",
    "world cup 2026",
    "FIFA",
    "pronosticos",
    "marcadores",
    "copa del mundo",
  ],
  authors: [{ name: "Legendsoft" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Quiniela Mundial",
    title: "Quiniela Mundial — Predice los resultados",
    description:
      "Predice los marcadores de los 104 partidos del Mundial. Compite contra amigos y escala en el ranking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiniela Mundial",
    description:
      "Predice los marcadores del Mundial y compite por el primer lugar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

Because `metadataBase` is already set to `siteUrl`, using `canonical: "/"` is enough — Next.js resolves it to the full URL automatically.

- [ ] **Step 2: Add canonical to matches page**

Open `src/app/matches/page.tsx`. Update the `metadata` export to add `alternates`:

```ts
export const metadata: Metadata = {
  title: "Partidos",
  description:
    "Consulta los 104 partidos del Mundial: fase de grupos, octavos, cuartos, semifinales y la gran final. Haz tus predicciones antes de que cierren.",
  alternates: {
    canonical: "/matches",
  },
  openGraph: {
    title: "Partidos — Quiniela Mundial",
    description:
      "Todos los partidos del Mundial. Predice marcadores y acumula puntos.",
  },
};
```

- [ ] **Step 3: Add canonical to leaderboard page**

Open `src/app/leaderboard/page.tsx`. Update the `metadata` export to add `alternates`:

```ts
export const metadata: Metadata = {
  title: "Ranking",
  description:
    "Tabla de posiciones de la quiniela del Mundial. Consulta quien lidera la clasificacion y cuantos puntos llevas acumulados.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    title: "Ranking — Quiniela Mundial",
    description:
      "Tabla de posiciones de la quiniela. Mira quien va ganando.",
  },
};
```

- [ ] **Step 4: Create rules layout with metadata**

Create `src/app/rules/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reglas",
  description:
    "Conoce el sistema de puntuacion de la quiniela. Ganas 5 puntos por marcador exacto, 3 por ganador correcto y 2 por empate correcto.",
  alternates: {
    canonical: "/rules",
  },
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

This is a Server Component that wraps the `"use client"` `page.tsx` and provides metadata. The `children` passthrough adds zero markup.

- [ ] **Step 5: Create sign-in layout with metadata**

Create `src/app/sign-in/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede a tu cuenta de Quiniela Mundial para hacer tus predicciones del Mundial 2026.",
  alternates: {
    canonical: "/sign-in",
  },
  robots: { index: false },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors. The build output should list the `/rules` and `/sign-in` routes with their page sizes.

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/app/matches/page.tsx src/app/leaderboard/page.tsx src/app/rules/layout.tsx src/app/sign-in/layout.tsx
git commit -m "feat(seo): add canonical URLs and metadata to all public pages"
```

---

## Task 4: Homepage SSR Refactor

**Files:**
- Create: `src/components/countdown-timer.tsx`
- Modify: `src/app/page.tsx`

**Context:** The current `src/app/page.tsx` is `"use client"` which means Google sees near-empty HTML on first load. The goal is to make `page.tsx` a Server Component that renders the full hero in SSR-ready HTML, while extracting the countdown + particles into a small `CountdownTimer` Client Component.

- [ ] **Step 1: Create the CountdownTimer client component**

Create `src/components/countdown-timer.tsx`:

```tsx
"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

const WORLD_CUP_DATE = new Date("2026-06-11T00:00:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SERVER_SNAPSHOT: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

let cachedSnapshot = SERVER_SNAPSHOT;
let cachedSecond = -1;

function getSnapshot(): TimeLeft {
  const now = Math.floor(Date.now() / 1000);
  if (now !== cachedSecond) {
    cachedSecond = now;
    const diff = Math.max(
      0,
      Math.floor((WORLD_CUP_DATE - now * 1000) / 1000)
    );
    cachedSnapshot = {
      days: Math.floor(diff / 86400),
      hours: Math.floor((diff % 86400) / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: diff % 60,
    };
  }
  return cachedSnapshot;
}

function getServerSnapshot(): TimeLeft {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  const interval = setInterval(onStoreChange, 1000);
  return () => clearInterval(interval);
}

function useCountdown(): TimeLeft {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="countdown-item flex flex-col items-center">
      <span className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wide text-neutral-300">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer() {
  const timeLeft = useCountdown();
  const countdownRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (particlesRef.current) {
        const particles = particlesRef.current.children;
        Array.from(particles).forEach((particle) => {
          gsap.set(particle, {
            x: gsap.utils.random(0, window.innerWidth),
            y: gsap.utils.random(0, window.innerHeight),
            opacity: gsap.utils.random(0.1, 0.4),
            scale: gsap.utils.random(0.3, 1),
          });
          gsap.to(particle, {
            y: `-=${gsap.utils.random(100, 300)}`,
            x: `+=${gsap.utils.random(-80, 80)}`,
            opacity: 0,
            duration: gsap.utils.random(3, 6),
            repeat: -1,
            ease: "none",
            delay: gsap.utils.random(0, 3),
          });
        });
      }

      gsap.fromTo(
        ".countdown-item",
        { opacity: 0, y: 60, scale: 0.8 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        }
      );

      gsap.to(countdownRef.current, {
        boxShadow: "0 0 42px rgba(115, 115, 115, 0.22)",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-neutral-400/30"
          />
        ))}
      </div>

      <div
        ref={countdownRef}
        className="rounded-3xl border border-white/70 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 p-8 text-white shadow-[0_14px_48px_-18px_rgba(10,10,10,0.6)] backdrop-blur-sm"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-neutral-300">
          Faltan
        </p>
        <div className="flex justify-center gap-3 sm:gap-5">
          <CountdownUnit value={timeLeft.days} label="Dias" />
          <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
            :
          </span>
          <CountdownUnit value={timeLeft.hours} label="Horas" />
          <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
            :
          </span>
          <CountdownUnit value={timeLeft.minutes} label="Min" />
          <span className="mt-1 self-start text-3xl font-bold text-neutral-300">
            :
          </span>
          <CountdownUnit value={timeLeft.seconds} label="Seg" />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Replace page.tsx with a Server Component**

Overwrite `src/app/page.tsx` entirely with:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";

export default function HomePage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-100 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_55%),radial-gradient(circle_at_80%_15%,rgba(212,212,212,0.3),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(229,229,229,0.45),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(163,163,163,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(163,163,163,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 max-w-lg space-y-8 text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.035em] text-neutral-900 sm:text-7xl">
          Quiniela Mundial
        </h1>

        <p className="text-xl font-medium text-neutral-600 sm:text-2xl">
          Quiniela del Mundial de Futbol
        </p>

        <CountdownTimer />

        <p className="text-sm text-neutral-600">
          11 de junio - 19 de julio, 2026 &middot; USA, Mexico y Canada
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/matches">
            <Button
              size="lg"
              className="h-12 w-full min-w-[160px] border border-neutral-800 bg-neutral-900 text-base text-white hover:bg-neutral-800"
            >
              Ver partidos
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver ranking
            </Button>
          </Link>
          <Link href="/rules">
            <Button
              variant="outline"
              size="lg"
              className="h-12 w-full min-w-[160px] border-neutral-300 bg-white/75 text-base text-neutral-900 hover:bg-neutral-100"
            >
              Ver reglas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**What changed vs original:**
- Removed `"use client"` directive — page is now a Server Component
- Removed all `useRef`, `useEffect`, `useSyncExternalStore` imports
- Removed GSAP imports and animation logic from this file
- Removed `opacity-0` from H1, subtitle, info text, and buttons (no GSAP to reveal them)
- Removed `action-btn` className (only used for GSAP targeting)
- Replaced the full countdown block with `<CountdownTimer />`
- Particles moved inside `CountdownTimer`

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors. The root `/` route should appear as a static Server Component in the build output (not marked as dynamic client).

- [ ] **Step 5: Commit**

```bash
git add src/components/countdown-timer.tsx src/app/page.tsx
git commit -m "feat(seo): refactor homepage to Server Component, extract CountdownTimer"
```

---

## Task 5: CLS Fix on Match Detail Page

**Files:**
- Modify: `src/app/matches/[matchId]/page.tsx`
- Modify: `next.config.ts`

**Context:** Flag images come from `https://flagcdn.com/w40/{iso}.png`. They use `<img>` without explicit `width`/`height` attributes which causes Cumulative Layout Shift. Switching to Next.js `<Image>` with explicit dimensions eliminates CLS and enables lazy loading. `flagcdn.com` must be added to `next.config.ts` `remotePatterns`.

- [ ] **Step 1: Configure flagcdn.com in next.config.ts**

Open `next.config.ts`. Replace the entire file with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Replace img tags with Next.js Image in match detail**

Open `src/app/matches/[matchId]/page.tsx`. Add the `Image` import at the top:

```tsx
import Image from "next/image";
```

Find the home team flag block (around line 89–95):

```tsx
{match.homeTeam?.flagUrl && (
  <img
    src={match.homeTeam.flagUrl}
    alt={match.homeTeam.code}
    className="w-12 h-9 object-cover rounded shadow-sm mx-auto"
  />
)}
```

Replace with:

```tsx
{match.homeTeam?.flagUrl && (
  <Image
    src={match.homeTeam.flagUrl}
    alt={match.homeTeam.name ?? match.homeTeam.code}
    width={48}
    height={36}
    className="object-cover rounded shadow-sm mx-auto"
  />
)}
```

Find the away team flag block (around line 115–121):

```tsx
{match.awayTeam?.flagUrl && (
  <img
    src={match.awayTeam.flagUrl}
    alt={match.awayTeam.code}
    className="w-12 h-9 object-cover rounded shadow-sm mx-auto"
  />
)}
```

Replace with:

```tsx
{match.awayTeam?.flagUrl && (
  <Image
    src={match.awayTeam.flagUrl}
    alt={match.awayTeam.name ?? match.awayTeam.code}
    width={48}
    height={36}
    className="object-cover rounded shadow-sm mx-auto"
  />
)}
```

Note: `alt` uses `name` instead of `code` for better accessibility ("México" vs "MEX").

- [ ] **Step 3: Add canonical to generateMetadata**

In the same file, update `generateMetadata` to add the canonical URL. The function currently returns a `Metadata` object — add `alternates`:

```ts
return {
  title,
  description,
  alternates: {
    canonical: `/matches/${matchId}`,
  },
  openGraph: {
    title: `${title} — Quiniela Mundial`,
    description,
  },
};
```

Also add it to the not-found fallback:

```ts
if (!match) return { title: "Partido no encontrado" };
```

(No canonical needed for 404 fallback — leave as is.)

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 5: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/matches/[matchId]/page.tsx next.config.ts
git commit -m "fix(seo): replace img with Image for flag CLS fix, add canonical to match detail"
```
