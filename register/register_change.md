# Change Register

Project changelog maintained automatically by OpenCode.

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
