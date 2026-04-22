# Change Register

Project changelog maintained automatically by OpenCode.

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
