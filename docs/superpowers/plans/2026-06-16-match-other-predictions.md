# Predicciones de otros usuarios — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En `/matches/[matchId]`, mostrar la lista de predicciones de otros usuarios, revelada solo cuando el partido ya cerró.

**Architecture:** Un API route nuevo (`GET /api/matches/[matchId]/predictions`) aplica el gating por `status` y la lógica de datos; un componente cliente (`MatchOtherPredictions`) lo consume con paginación client-side; se integra en `MatchDetailClient` debajo del `PredictionForm`.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 + Postgres, React 19, Vitest + Testing Library, componentes `ui/avatar`, `ui/badge`, `ui/button`, `ui/skeleton`.

## Global Constraints

- TypeScript estricto: **nunca usar `any`** en interfaces (regla de CLAUDE.md).
- Peticiones de datos desde el cliente se hacen **vía API route**, no server action.
- El **email completo nunca se expone** en la respuesta del API.
- Las predicciones ajenas solo se revelan cuando `match.status` es `"locked"` o `"finished"`. Con `"scheduled"` se devuelve lista vacía.
- Seguir patrones existentes: tests de route estilo `src/app/api/admin/stats/route.test.ts`; paginación estilo `src/components/leaderboard-table.tsx` (`PAGE_SIZE`, `useState` page, `slice`).

---

### Task 1: API endpoint `GET /api/matches/[matchId]/predictions`

**Files:**
- Create: `src/app/api/matches/[matchId]/predictions/route.ts`
- Test: `src/app/api/matches/[matchId]/predictions/route.test.ts`

**Interfaces:**
- Produces: `GET(_req, { params: Promise<{ matchId: string }> })`. Respuesta JSON:
  - 404: `{ error: "Partido no encontrado" }`
  - scheduled: `{ locked: false, predictions: [] }`
  - cerrado: `{ locked: true, predictions: OtherPrediction[] }`
  - `OtherPrediction = { id: string; homeScore: number; awayScore: number; points: number | null; user: { name: string; image: string | null } }`

- [ ] **Step 1: Write the failing test**

Crear `src/app/api/matches/[matchId]/predictions/route.test.ts`:

```ts
import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown, init?: ResponseInit) => ({
      _data: data,
      status: init?.status ?? 200,
      json: async () => data,
    })),
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: { findUnique: vi.fn() },
    prediction: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "./route";

const mockMatchFindUnique = prisma.match.findUnique as ReturnType<typeof vi.fn>;
const mockPredictionFindMany = prisma.prediction.findMany as ReturnType<typeof vi.fn>;

function makeParams(matchId: string) {
  return { params: Promise.resolve({ matchId }) };
}

function predictionRow(overrides: {
  id?: string;
  homeScore?: number;
  awayScore?: number;
  points?: number | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} = {}) {
  return {
    id: overrides.id ?? "p1",
    homeScore: overrides.homeScore ?? 2,
    awayScore: overrides.awayScore ?? 1,
    points: overrides.points ?? null,
    user: {
      name: overrides.name ?? "Alice",
      email: overrides.email ?? "alice@example.com",
      image: overrides.image ?? null,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/matches/[matchId]/predictions", () => {
  test("returns 404 when match does not exist", async () => {
    mockMatchFindUnique.mockResolvedValue(null);

    await GET(new Request("http://t"), makeParams("missing"));

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Partido no encontrado" },
      { status: 404 }
    );
  });

  test("hides predictions while match is scheduled", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "scheduled" });

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data).toEqual({ locked: false, predictions: [] });
    expect(mockPredictionFindMany).not.toHaveBeenCalled();
  });

  test("reveals predictions when match is locked", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "locked" });
    mockPredictionFindMany.mockResolvedValue([predictionRow()]);

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data.locked).toBe(true);
    expect(data.predictions).toHaveLength(1);
    expect(data.predictions[0]).toEqual({
      id: "p1",
      homeScore: 2,
      awayScore: 1,
      points: null,
      user: { name: "Alice", image: null },
    });
  });

  test("orders by points descending", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "finished" });
    mockPredictionFindMany.mockResolvedValue([]);

    await GET(new Request("http://t"), makeParams("m1"));

    const callArg = mockPredictionFindMany.mock.calls[0][0];
    expect(callArg.orderBy).toEqual([
      { points: { sort: "desc", nulls: "last" } },
      { createdAt: "asc" },
    ]);
  });

  test("never exposes the full email; derives name from local-part when name is null", async () => {
    mockMatchFindUnique.mockResolvedValue({ id: "m1", status: "finished" });
    mockPredictionFindMany.mockResolvedValue([
      predictionRow({ name: null, email: "bob@example.com", points: 5 }),
    ]);

    await GET(new Request("http://t"), makeParams("m1"));

    const [data] = (NextResponse.json as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(data.predictions[0].user.name).toBe("bob");
    expect(JSON.stringify(data)).not.toContain("bob@example.com");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/matches/\[matchId\]/predictions/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/app/api/matches/[matchId]/predictions/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface OtherPrediction {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user: { name: string; image: string | null };
}

function displayName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim();
  if (email) return email.split("@")[0];
  return "Anónimo";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, status: true },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Partido no encontrado" },
      { status: 404 }
    );
  }

  if (match.status === "scheduled") {
    return NextResponse.json({ locked: false, predictions: [] });
  }

  const rows = await prisma.prediction.findMany({
    where: { matchId },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: [
      { points: { sort: "desc", nulls: "last" } },
      { createdAt: "asc" },
    ],
  });

  const predictions: OtherPrediction[] = rows.map((p) => ({
    id: p.id,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    points: p.points,
    user: {
      name: displayName(p.user.name, p.user.email),
      image: p.user.image,
    },
  }));

  return NextResponse.json({ locked: true, predictions });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/matches/\[matchId\]/predictions/route.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/matches/[matchId]/predictions/route.ts" "src/app/api/matches/[matchId]/predictions/route.test.ts"
git commit -m "feat(api): add others' predictions endpoint for a match

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `MatchOtherPredictions` component

**Files:**
- Create: `src/components/match-other-predictions.tsx`
- Test: `src/components/match-other-predictions.test.tsx`

**Interfaces:**
- Consumes: `GET /api/matches/[matchId]/predictions` (de Task 1).
- Produces: `MatchOtherPredictions({ matchId, matchStatus }: { matchId: string; matchStatus: string })` (named export).

- [ ] **Step 1: Write the failing test**

Crear `src/components/match-other-predictions.test.tsx`:

```tsx
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MatchOtherPredictions } from "@/components/match-other-predictions";

const realFetch = global.fetch;

afterEach(() => {
  global.fetch = realFetch;
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MatchOtherPredictions", () => {
  test("shows reveal message and does not fetch while match is scheduled", () => {
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="scheduled" />);

    expect(
      screen.getByText(/se revelar/i)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("renders a row with predicted score and points when finished", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        locked: true,
        predictions: [
          {
            id: "p1",
            homeScore: 2,
            awayScore: 1,
            points: 5,
            user: { name: "Alice", image: null },
          },
        ],
      }),
    }) as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="finished" />);

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("2 - 1")).toBeInTheDocument();
    expect(screen.getByText(/5 pts/i)).toBeInTheDocument();
  });

  test("shows empty state when there are no predictions", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ locked: true, predictions: [] }),
    }) as unknown as typeof fetch;

    render(<MatchOtherPredictions matchId="m1" matchStatus="finished" />);

    await waitFor(() =>
      expect(screen.getByText(/no hay predicciones/i)).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/match-other-predictions.test.tsx`
Expected: FAIL — `Cannot find module '@/components/match-other-predictions'`.

- [ ] **Step 3: Write minimal implementation**

Crear `src/components/match-other-predictions.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

interface OtherPrediction {
  id: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  user: { name: string; image: string | null };
}

interface ApiResponse {
  locked: boolean;
  predictions: OtherPrediction[];
}

export function MatchOtherPredictions({
  matchId,
  matchStatus,
}: {
  matchId: string;
  matchStatus: string;
}) {
  const isOpen = matchStatus === "scheduled";
  const isFinished = matchStatus === "finished";
  const [predictions, setPredictions] = useState<OtherPrediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/matches/${matchId}/predictions`);
        if (!res.ok) throw new Error("No se pudieron cargar las predicciones");
        const json: ApiResponse = await res.json();
        if (!cancelled) setPredictions(json.predictions);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error inesperado");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [matchId, isOpen]);

  const heading = (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
      Predicciones de otros
    </h2>
  );

  if (isOpen) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          Las predicciones de otros se revelarán cuando cierre el partido.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          {error}
        </p>
      </section>
    );
  }

  if (!predictions) {
    return (
      <section className="space-y-3">
        {heading}
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
    );
  }

  if (predictions.length === 0) {
    return (
      <section className="space-y-3">
        {heading}
        <p className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-sm text-white/65 backdrop-blur-sm">
          Aún no hay predicciones para este partido.
        </p>
      </section>
    );
  }

  const pageCount = Math.max(1, Math.ceil(predictions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = predictions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <section className="space-y-3">
      {heading}
      <ul className="space-y-2">
        {visible.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-sm"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={p.user.image ?? ""} />
              <AvatarFallback className="bg-white/15 text-xs text-white">
                {p.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm text-white">
              {p.user.name}
            </span>
            <span className="text-sm font-semibold tabular-nums text-white">
              {p.homeScore} - {p.awayScore}
            </span>
            {isFinished && p.points !== null && (
              <Badge
                variant="secondary"
                className="border border-white/15 bg-white/12 text-white"
              >
                {p.points} pts
              </Badge>
            )}
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm text-white/70">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/match-other-predictions.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/match-other-predictions.tsx src/components/match-other-predictions.test.tsx
git commit -m "feat(matches): add MatchOtherPredictions list component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Integrate into `MatchDetailClient`

**Files:**
- Modify: `src/components/match-detail-client.tsx`

**Interfaces:**
- Consumes: `MatchOtherPredictions` (de Task 2). `match.status` ya disponible en el render del cliente.

- [ ] **Step 1: Add the import**

En `src/components/match-detail-client.tsx`, junto a los demás imports de componentes (después de la línea `import { PredictionForm } from "@/components/prediction-form";`), añadir:

```tsx
import { MatchOtherPredictions } from "@/components/match-other-predictions";
```

- [ ] **Step 2: Render the section below the prediction summary**

En el mismo archivo, dentro del `return (...)`, justo antes de la etiqueta de cierre `</>`, después del bloque:

```tsx
      {prediction && isFinished && (
        <div className="space-y-1 rounded-lg border border-white/15 bg-white/10 p-4 text-center backdrop-blur-sm">
          <p className="text-sm text-white/65">
            Tu predicción: {prediction.homeScore} - {prediction.awayScore}
          </p>
          <p className="text-lg font-bold">
            {prediction.points !== null
              ? `${prediction.points} puntos`
              : "Pendiente de calificar"}
          </p>
        </div>
      )}
```

añadir:

```tsx
      <MatchOtherPredictions matchId={match.id} matchStatus={match.status} />
```

- [ ] **Step 3: Run the full test suite and lint**

Run: `npm run test && npm run lint`
Expected: PASS — todos los tests pasan, sin errores de lint.

- [ ] **Step 4: Commit**

```bash
git add src/components/match-detail-client.tsx
git commit -m "feat(matches): show other users' predictions on match detail

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** gating por status (Task 1), datos mostrados avatar/nombre/marcador/puntos (Task 2), no expone email (Task 1), paginación client-side (Task 2), integración bajo PredictionForm (Task 3), pruebas de endpoint (Task 1). Todo cubierto.
- **Tipos:** `OtherPrediction` idéntico en route, test y componente. `MatchOtherPredictions({ matchId, matchStatus })` consistente entre Task 2 y Task 3.
- **Sin placeholders:** todo el código está completo.
