# Change Register

Project changelog maintained automatically by OpenCode.

---

## [2026-04-30 00:12] - Restauracion de la ruta publica /matches

**Prompt:** Continuar con los siguientes pasos y resolver la regresion donde la ruta `/matches` habia desaparecido.
**Files modified:**
- `src/app/(public)/matches/page.test.tsx` - nueva prueba de regresion para validar metadata, listado de partidos y predicciones del usuario en `/matches`
- `src/app/(public)/matches/page.tsx` - pagina indice de partidos restaurada dentro del route group publico con tabs por grupo/etapa y estilos compatibles con el fondo global oscuro
- `register/register_change.md` - registro actualizado con la restauracion de la ruta

**Description:**
Se investigo la causa raiz de la regresion y se confirmo que el detalle `src/app/(public)/matches/[matchId]/page.tsx` seguia existiendo, pero el indice `src/app/(public)/matches/page.tsx` ya no estaba presente, por lo que `/matches` habia desaparecido del arbol de rutas. Se recupero el contrato funcional desde el historial de git para evitar reinventar comportamiento y se siguio TDD agregando primero una prueba que fallaba por modulo inexistente. Luego se restauro la pagina con metadata canonica de `/matches`, consulta de partidos y predicciones, tabs por grupo/etapa y render de `MatchCard`, adaptando solo la presentacion para el fondo oscuro global actual.

Verificacion realizada: `npm test -- "src/app/(public)/matches/page.test.tsx"`, `npm test -- src/app/layout.test.tsx "src/app/(public)/layout.test.tsx" src/app/seo.test.ts src/components/home-hero.test.tsx "src/app/(public)/matches/page.test.tsx"` y `npm run build`, confirmando nuevamente la presencia de `/matches` y `/matches/[matchId]` en el output final del build.

---

## [2026-04-29 00:00] - Spec de fondo de puntos reactivo al cursor en el hero

**Prompt:** Hacer que la animacion de GSAP sea un fondo con puntos blancos y que el cursor tenga un efecto blanco continuo que afecte los puntos cercanos.
**Files modified:**
- `.gitignore` - agregado `.superpowers/` para ignorar archivos locales del companion visual
- `docs/superpowers/specs/2026-04-29-hero-cursor-particles-design.md` - nueva spec del diseño aprobado para el hero con puntos reactivos al cursor
- `register/register_change.md` - registro de la sesion actualizado

**Description:**
Se exploro la implementacion actual del hero en `src/components/home-hero.tsx`, se validaron preferencias visuales con companion en navegador y se aprobo la direccion `A`: un fondo limpio y sutil con puntos blancos, halo blanco que sigue el cursor dentro del hero y reaccion local de puntos cercanos. Se documento la solucion en una spec enfocada en mantener el cambio contenido en `HomeHero`, reusar GSAP con `useGSAP()` y `gsap.quickTo()`, y preservar la jerarquia visual actual del contenido.

---

## [2026-04-29 23:21] - Implementacion del hero con puntos reactivos al cursor

**Prompt:** Implementar el fondo del hero con puntos blancos y un halo blanco que siga el cursor y afecte los puntos cercanos.
**Files modified:**
- `src/components/home-hero.tsx` - reemplazo del polvo flotante por campo de puntos denso, glow reactivo al cursor, throttling por frame y soporte para reduced motion
- `src/components/home-hero.test.tsx` - prueba de estructura para capas del hero y densidad del campo de puntos
- `docs/superpowers/plans/2026-04-29-hero-cursor-particles-implementation.md` - plan de implementacion guardado para el cambio
- `register/register_change.md` - registro actualizado con la implementacion final

**Description:**
Se implemento el rediseño del fondo del hero en `HomeHero` manteniendo el componente como Client Component y preservando la animacion de entrada existente. El nuevo fondo usa una malla determinista de 36 puntos blancos posicionados dentro del hero, un halo blanco con gradiente radial y seguimiento suave mediante `gsap.quickTo()`, y una reaccion local de opacidad/escala para los puntos cercanos al cursor. Para reducir trabajo en el hot path, el efecto del cursor se agrupo a una actualizacion por `requestAnimationFrame`, y se desactiva tanto el seguimiento como la entrada animada cuando `prefers-reduced-motion` esta activo.

Verificacion realizada: `npm test -- src/components/home-hero.test.tsx` y `npx eslint src/components/home-hero.tsx src/components/home-hero.test.tsx`.

---

## [2026-04-29 23:35] - Spec para extender el fondo animado a paginas publicas

**Prompt:** Hacer que ese fondo animado este en todas las paginas publicas.
**Files modified:**
- `docs/superpowers/specs/2026-04-29-public-pages-background-design.md` - nueva spec para compartir el fondo animado a nivel de layout publico
- `register/register_change.md` - registro actualizado con el nuevo alcance de diseno

**Description:**
Se definio el nuevo alcance: aplicar el fondo animado solo en paginas publicas (`/`, `matches`, `match detail`, `leaderboard`, `rules`) y excluir `sign-in`, `predictions` y todo `admin`. La solucion aprobada mueve el fondo a un layout publico compartido con un componente reusable (`PublicBackground`), saca la responsabilidad del fondo fuera de `HomeHero` y evita condiciones por pathname en el root layout. La spec tambien deja previsto que pueden requerirse ajustes minimos de contraste en paginas publicas internas para mantener legibilidad.

---

## [2026-04-29 23:41] - Implementacion de fondo animado compartido en paginas publicas

**Prompt:** Implementar que el fondo animado este en todas las paginas publicas.
**Files modified:**
- `src/components/public-background.tsx` - nuevo componente reusable con aurora, puntos, halo y logica de cursor compartida
- `src/app/(public)/layout.tsx` - nuevo layout publico que monta el fondo animado una sola vez
- `src/app/(public)/page.tsx` - homepage movida al route group publico
- `src/app/(public)/matches/page.tsx` - pagina de partidos movida al route group publico y ajustada para contraste sobre fondo oscuro
- `src/app/(public)/matches/[matchId]/page.tsx` - detalle de partido movido al route group publico y ajustado para contraste
- `src/app/(public)/leaderboard/page.tsx` - ranking movido al route group publico
- `src/app/(public)/rules/page.tsx` - reglas movida al route group publico y ajustada visualmente para el nuevo fondo
- `src/app/(public)/rules/layout.tsx` - metadata de `/rules` restaurada dentro del route group
- `src/components/home-hero.tsx` - hero simplificado para dejar de ser dueño del fondo global
- `src/components/home-hero.test.tsx` - tests actualizados para verificar que `HomeHero` solo renderiza contenido
- `src/app/(public)/layout.test.tsx` - nuevo test para validar el layout publico compartido
- `src/app/seo.test.ts` - import de metadata de `/rules` ajustado al nuevo route group
- `src/components/leaderboard-table.tsx` - ajuste minimo de contraste para el fondo publico oscuro
- `src/components/match-card.tsx` - handlers GSAP ajustados para evitar acceso a refs durante render
- `docs/superpowers/plans/2026-04-29-public-pages-background-implementation.md` - plan de implementacion del cambio global
- `register/register_change.md` - registro actualizado con la implementacion final

**Description:**
Se implemento un route group publico que comparte el fondo animado en `/`, `matches`, `match detail`, `leaderboard` y `rules`, dejando fuera `sign-in`, `predictions` y `admin`. El fondo ahora vive en `PublicBackground`, usando GSAP con `matchMedia()` para combinar `pointer: fine` y `prefers-reduced-motion`, mientras que `HomeHero` conserva solo el contenido y su entrada animada. Durante la integracion se detectaron y corrigieron dos regresiones: la perdida de metadata de `/rules` al mover la ruta y la falta de interaccion del fondo por `pointer-events-none` en el contenedor raiz. Tambien se hicieron ajustes minimos de contraste para que algunas vistas publicas siguieran siendo legibles sobre el fondo compartido.

Verificacion realizada: `npm test -- "src/app/seo.test.ts" "src/app/(public)/layout.test.tsx" src/components/home-hero.test.tsx` y `npx eslint ...` sobre los archivos tocados, con resultado final de 0 errores y 2 warnings preexistentes por `<img>` en `src/components/match-card.tsx`.

---

## [2026-04-29 23:51] - Correccion de 404 en leaderboard y altura minima en paginas publicas

**Prompt:** Corregir el problema donde `/leaderboard` devuelve 404 y aplicar `min-h-screen` en `matches` y `leaderboard` para que el fondo tome todo el alto.
**Files modified:**
- `src/components/public-background.tsx` - fix de tipado en `gsap.matchMedia()` para restaurar compilacion del layout publico
- `src/app/(public)/matches/page.tsx` - agregado `min-h-screen` al contenedor raiz
- `src/app/(public)/leaderboard/page.tsx` - agregado `min-h-screen` al contenedor raiz
- `register/register_change.md` - registro actualizado con la correccion

**Description:**
Se investigo el 404 de `/leaderboard` y la causa real no era el route group en si, sino un fallo de TypeScript en `PublicBackground` que rompia el build del arbol publico compartido. Se corrigio el acceso tipado a `context.conditions` en `gsap.matchMedia()` y luego se confirmo con build exitoso que `/leaderboard` vuelve a existir como ruta estatica. Adicionalmente se aplico `min-h-screen` en las paginas de `matches` y `leaderboard` para que el fondo compartido cubra toda la altura visible.

Verificacion realizada: `npm run build` y `npm test -- "src/app/seo.test.ts" "src/app/(public)/layout.test.tsx" src/components/home-hero.test.tsx`.

---

## [2026-04-29 23:58] - Spec para fondo animado global en toda la app

**Prompt:** Agregar el fondo animado tambien en todas las demas paginas, incluyendo sign-in, predictions y admin.
**Files modified:**
- `docs/superpowers/specs/2026-04-29-global-app-background-design.md` - nueva spec para mover el fondo compartido al layout raiz de toda la app
- `register/register_change.md` - registro actualizado con el nuevo alcance global

**Description:**
Se amplio el alcance del fondo animado para cubrir toda la aplicacion, ya no solo las paginas publicas. La solucion aprobada mueve la propiedad del fondo compartido a `src/app/layout.tsx`, deja de depender del layout `(public)` para renderizarlo y anticipa ajustes minimos de contraste en `sign-in`, `predictions` y `admin` para mantener legibilidad sobre el fondo oscuro animado.

---

## [2026-04-23 09:37] - Rediseño frontend a estilo Apple claro (negro/blanco/grises)

**Prompt:** Cambiar el frontend de la quiniela a una línea visual Apple clara, reemplazando acentos azules por una paleta neutra y ejecutando el plan real.
**Files modified:**
- `src/app/globals.css` - redefinición de tokens globales a paleta monocromática y ajuste de radio para look más premium
- `src/app/manifest.ts` - `theme_color` y `background_color` actualizados a tonos neutros
- `src/components/navbar.tsx` - navegación principal migrada de azul a neutros con superficie translúcida clara
- `src/app/page.tsx` - home rediseñada con gradientes/texturas neutras y glow gris en animación
- `src/app/rules/page.tsx` - cards, badges y acentos convertidos a jerarquía en grises
- `src/app/sign-in/page.tsx` - estilos del formulario de autenticación migrados a neutros
- `src/components/ui/sonner.tsx` - toasts ajustados a variantes sobrias mayormente neutras
- `src/app/matches/page.tsx` - título y acentos principales migrados a neutros
- `src/app/matches/[matchId]/page.tsx` - badges/superficies de detalle de partido convertidas a grises
- `src/app/predictions/page.tsx` - encabezado y total adaptados a nueva línea visual
- `src/app/leaderboard/page.tsx` - título y jerarquía tipográfica ajustados a estilo neutro
- `src/components/match-card.tsx` - card/bloque central migrados de azul a superficies grises
- `src/app/admin/page.tsx` - encabezado admin migrado a neutros
- `src/app/admin/layout.tsx` - título admin migrado a neutros

**Description:**
Se ejecutó la migración visual del frontend hacia un estilo Apple claro, manteniendo funcionalidad y estructura existentes. El trabajo priorizó consistencia de diseño mediante tokens globales y eliminación de clases de color saturadas (`blue`, `emerald`, `amber`, `red`) en las vistas principales, sustituyéndolas por contraste tipográfico, bordes suaves y superficies en escala de grises.

Verificación realizada: `npm run lint` sin errores (solo warnings preexistentes por uso de `<img>`). `npm run build` compila pero falla en recolección de datos por ausencia de `DATABASE_URL` en entorno de build, comportamiento no introducido por este cambio visual.

---

## [2026-04-22 22:38] - Correccion de carga de entorno para seed y ejecucion exitosa

**Prompt:** Volver a ejecutar seed y dejarlo funcionando con la data inicial.
**Files modified:**
- `prisma/seed.ts` - se agrego carga explicita de `.env.local` antes de ejecutar seed

**Description:**
Se identifico la causa del fallo recurrente: el script de seed solo cargaba `.env` por defecto y no estaba leyendo `.env.local`, por lo que `DATABASE_URL` no se inyectaba en tiempo de ejecucion. Se actualizo `prisma/seed.ts` para ejecutar `config({ path: ".env.local" })` y luego `config()` para fallback. Tras el cambio, `npm run seed` se ejecuto correctamente y cargo la data inicial completa en Supabase (`48 teams`, `104 matches`).

---

## [2026-04-22 22:25] - Creacion de estructura de BD en Supabase

**Prompt:** Crear toda la estructura de la base de datos en Supabase.
**Files modified:**
- `prisma/init_schema.sql` - script SQL generado desde `prisma/schema.prisma`

**Description:**
Se genero el SQL de estructura completa del esquema Prisma y se aplico como migracion remota en el proyecto Supabase `kmejsjazewuhokajvpik` con nombre `init_quiniela_schema`. La validacion con `supabase_list_tables` confirmo la creacion de todas las tablas, indices y llaves foraneas en `public` (`User`, `Account`, `Session`, `VerificationToken`, `Team`, `Match`, `Prediction`, `ScoringConfig`).

Adicionalmente se intento ejecutar el seed (`npm run seed`), pero fallo por error de TLS en la conexion de runtime (`P1011`), por lo que la estructura esta creada pero sin datos iniciales cargados desde el script de seed.

---

## [2026-04-22 22:09] - Configuracion de DATABASE_URL en entorno local

**Prompt:** Asignar la URL de Postgres/Supabase proporcionada por el usuario en la variable de entorno de base de datos.
**Files modified:**
- `.env.local` - agregado `DATABASE_URL` con el valor proporcionado

**Description:**
Se creo el archivo `.env.local` y se configuro `DATABASE_URL` con la cadena indicada por el usuario. Luego se verifico la integracion ejecutando `npx prisma generate` y `npm run build`; ambos comandos finalizaron correctamente y el build completo de Next.js genero todas las rutas, incluyendo `sitemap.xml`, sin errores de conexion.

---

## [2026-04-22 22:02] - Integracion de Supabase pooler en configuracion del proyecto

**Prompt:** Conectar el proyecto quiniela con Supabase usando pooler.
**Files modified:**
- `prisma.config.ts` - datasource configurado para priorizar `DIRECT_URL` y fallback a `DATABASE_URL`
- `src/lib/prisma.ts` - validacion explicita de `DATABASE_URL` antes de crear el pool
- `src/app/sitemap.ts` - manejo defensivo de error de DB para no romper generacion de sitemap
- `.env.example` - plantilla de variables para `DATABASE_URL`, `DIRECT_URL` y auth
- `README.md` - documentacion de configuracion con Supabase pooler y pasos de verificacion

**Description:**
Se implemento la configuracion base para conectar runtime y Prisma CLI con Supabase pooler de forma consistente. Se agrego documentacion y ejemplo de variables de entorno para facilitar setup local/deploy. Tambien se agrego manejo resiliente en sitemap para evitar fallos fatales por conectividad de DB durante build. La verificacion ejecuto `prisma generate`, `lint` y `build`; el build actualmente falla por ausencia de `DATABASE_URL` en el entorno local de ejecucion, lo cual confirma que falta configurar `.env.local` con credenciales reales antes de compilar exitosamente.

---

## [2026-04-22 19:05] - Renombrado de proyecto y retiro de logo en header

**Prompt:** Cambiar el nombre del proyecto a `quiniela-mundial`, actualizar cualquier texto posible relacionado, quitar la imagen del header y borrar la imagen; ademas renombrar la carpeta raiz.
**Files modified:**
- `package.json` - nombre del paquete cambiado a `quiniela-mundial`
- `package-lock.json` - nombre del paquete raiz actualizado a `quiniela-mundial`
- `src/components/navbar.tsx` - se elimino import/render del logo y se cambio el texto de marca a `Quiniela Mundial`
- `src/app/page.tsx` - titulo visible actualizado a `Quiniela Mundial`
- `src/app/predictions/page.tsx` - metadata descriptiva actualizada para remover referencia a 2026 en nombre
- `src/app/matches/page.tsx` - metadata y Open Graph actualizados a `Quiniela Mundial`
- `src/app/matches/[matchId]/page.tsx` - metadata dinamica actualizada a `Quiniela Mundial`
- `src/app/rules/page.tsx` - texto descriptivo actualizado
- `src/app/layout.tsx` - metadata global y URL por defecto cambiadas a `quiniela-mundial`
- `src/app/manifest.ts` - nombre corto/largo y descripcion del manifest actualizados
- `src/components/structured-data.tsx` - JSON-LD actualizado a `Quiniela Mundial`
- `src/app/robots.ts` - URL base por defecto cambiada a `https://quiniela-mundial.vercel.app`
- `src/app/sitemap.ts` - URL base por defecto cambiada a `https://quiniela-mundial.vercel.app`
- `src/app/leaderboard/page.tsx` - metadata y Open Graph actualizados
- `PROYECTO.md` - titulo y resumen ejecutivo ajustados al nuevo nombre
- `.claude/settings.local.json` - rutas internas de referencia actualizadas a `quiniela-mundial`
- `src/assets/Logo-Base-Blanco.png` - archivo eliminado

**Description:**
Se aplico el cambio de naming completo en codigo, metadata SEO/Open Graph/Twitter, manifest y documentacion para alinear el proyecto con la nueva identidad `quiniela-mundial`. Tambien se elimino el logo del header y se borro el archivo de imagen asociado para evitar recursos huerfanos. Finalmente se renombro la carpeta raiz de `mundial-2026-master` a `quiniela-mundial` en el filesystem.

---
