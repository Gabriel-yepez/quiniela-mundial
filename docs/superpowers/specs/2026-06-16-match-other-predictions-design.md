# Predicciones de otros usuarios en el detalle del partido

**Fecha:** 2026-06-16
**Rama:** `feature/match-other-predictions`

## Objetivo

En la página de detalle de un partido (`/matches/[matchId]`), permitir que un
usuario vea la lista de predicciones hechas por los demás usuarios para ese
partido.

## Reglas de visibilidad (gating)

Para evitar que los usuarios copien predicciones, las predicciones ajenas
**solo se revelan cuando el partido ya no admite predicciones**:

- `match.status === "scheduled"` (abierto): NO se exponen predicciones ajenas.
  Se muestra un mensaje indicando que se revelarán al cerrar el partido.
- `match.status === "locked"` o `"finished"`: se muestra la lista completa.

## Qué se muestra por cada predicción

- Avatar / foto de perfil del usuario (campo `user.image`).
- Nombre del usuario. Si `name` es `null`, se usa la parte anterior al `@` del
  email. **El email completo nunca se expone.**
- Marcador predicho (ej. `2-1`).
- Puntos obtenidos (`points`) — badge mostrado solo cuando el partido terminó.

## Arquitectura

Sigue las convenciones del proyecto: acceso a datos y lógica en el API route,
fetch desde el cliente, paginación client-side (igual que el leaderboard).

### 1. API: `GET /api/matches/[matchId]/predictions`

- Busca el partido. Si no existe → `404`.
- Si `match.status === "scheduled"` → responde `{ locked: false, predictions: [] }`.
- Si está cerrado → consulta:
  ```ts
  prisma.prediction.findMany({
    where: { matchId },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: [{ points: "desc" }, { createdAt: "asc" }],
  })
  ```
- Respuesta cerrada: `{ locked: true, predictions: OtherPrediction[] }`.
- `OtherPrediction = { id, homeScore, awayScore, points, user: { name, image } }`.
  El `name` se deriva en el servidor (nombre o local-part del email); el email
  crudo no sale del API.
- Tipado estricto, sin `any`.

### 2. Componente: `MatchOtherPredictions`

Componente cliente. Props: `matchId: string`, `matchStatus: string`.

- Si `matchStatus === "scheduled"`: muestra mensaje informativo, no hace fetch.
- Si está cerrado: hace fetch al endpoint.
  - Estado de carga con `Skeleton`.
  - Estado de error con mensaje (patrón de `MatchDetailClient`).
  - Estado vacío: "Aún no hay predicciones".
  - Lista de filas: avatar + nombre · marcador · badge de puntos (si terminó).
  - Paginación client-side (10 por página) con controles anterior/siguiente,
    consistente con `leaderboard-table.tsx`.

### 3. Integración en `MatchDetailClient`

Renderizar `<MatchOtherPredictions matchId={match.id} matchStatus={match.status} />`
debajo del `PredictionForm`. `match.status` ya está disponible en el cliente.

## Manejo de errores

- API: `404` si el partido no existe; errores de Prisma → `500`.
- Cliente: estado de error con mensaje legible.

## Pruebas

Test del endpoint que verifica:

- Oculta predicciones cuando el partido está `scheduled`.
- Las muestra cuando está `locked` / `finished`.
- Ordena por puntos descendente.
- No expone el email completo en la respuesta.
