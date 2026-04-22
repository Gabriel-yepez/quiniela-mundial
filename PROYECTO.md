# Quiniela Mundial 2026 - Explicacion del Proyecto

## Que es

Es una **aplicacion web de quiniela** para el Mundial de Futbol 2026. Los usuarios se registran, predicen los marcadores de los partidos, y ganan puntos segun que tan acertadas sean sus predicciones. Hay un leaderboard donde se rankean todos los participantes.

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js 16.2, React 19, TypeScript |
| Estilos | Tailwind CSS 4, shadcn/ui |
| Backend | API Routes de Next.js |
| Base de datos | SQLite (archivo local) con Prisma ORM |
| Autenticacion | NextAuth.js v5 (Google OAuth + email/password) |
| Notificaciones | Sonner (toasts) |

---

## Modelos de Datos (Base de Datos)

La base de datos tiene **6 tablas principales**:

1. **User** - Usuarios con nombre, email, password (hasheado con bcrypt), y un rol (`user` o `admin`)
2. **Team** - Los 48 equipos del mundial, con nombre, codigo (ej: "MEX"), grupo y bandera
3. **Match** - Los 80 partidos (72 de fase de grupos + 8 de eliminatorias), con fecha, sede, equipos, marcador y estado (`scheduled`, `locked`, `finished`)
4. **Prediction** - Las predicciones de cada usuario por partido: marcador local, marcador visitante y los puntos obtenidos
5. **ScoringConfig** - Configuracion de puntos que el admin puede ajustar
6. **Account/Session/VerificationToken** - Tablas de NextAuth para manejo de sesiones

---

## Flujo de Usuario

```
Registro/Login ──► Ver partidos ──► Hacer prediccion ──► Esperar resultado ──► Ver puntos
       │                                                                          │
       └──────────────────────── Ver leaderboard ◄────────────────────────────────┘
```

1. **Se registra** con email/password o Google
2. **Ve los partidos** en `/matches`, agrupados por grupo (A-L) y fase eliminatoria
3. **Entra a un partido** y llena su prediccion (marcador local y visitante)
4. **La prediccion se guarda** mientras el partido este en estado "scheduled"
5. **Cuando el admin ingresa el resultado**, el sistema calcula los puntos automaticamente
6. **Ve sus puntos** en `/predictions` y su posicion en `/leaderboard`

---

## Sistema de Puntuacion

| Acierto | Puntos (por defecto) |
|---------|---------------------|
| Marcador exacto (ej: predijo 2-1, fue 2-1) | **5 puntos** |
| Acerto el ganador pero no el marcador (ej: predijo 2-1, fue 3-0) | **3 puntos** |
| Predijo empate y fue empate, pero diferente marcador (ej: predijo 1-1, fue 0-0) | **2 puntos** |
| Fallo completamente | **0 puntos** |

El admin puede modificar estos valores desde `/admin/scoring`.

---

## Flujo del Administrador

```
Administrar partidos ──► Bloquear partido ──► Ingresar resultado ──► Puntos se calculan automaticamente
        │
        └──► Configurar puntos (cuantos pts por acierto exacto, ganador, empate)
```

1. **Bloquear partido** - Cambia el estado a `locked`, impidiendo nuevas predicciones (antes de que empiece el partido)
2. **Ingresar resultado** - Pone el marcador final, cambia el estado a `finished`, y automaticamente calcula los puntos de TODAS las predicciones de ese partido
3. **Configurar puntos** - Ajusta cuantos puntos vale cada tipo de acierto

---

## Paginas de la Aplicacion

| Ruta | Descripcion | Acceso |
|------|------------|--------|
| `/` | Pagina principal con countdown al mundial (11 junio 2026) | Publico |
| `/sign-in` | Login y registro | Publico |
| `/matches` | Lista de todos los partidos por grupo/fase | Publico |
| `/matches/[id]` | Detalle del partido + formulario de prediccion | Requiere login |
| `/predictions` | Mis predicciones y puntos acumulados | Requiere login |
| `/leaderboard` | Tabla de posiciones de todos los participantes | Publico |
| `/admin` | Gestion de partidos (resultados, bloqueo) | Solo admin |
| `/admin/scoring` | Configuracion de puntos | Solo admin |

---

## API Endpoints

| Metodo | Ruta | Funcion |
|--------|------|---------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| GET/POST | `/api/auth/[...nextauth]` | Handlers de NextAuth (login, sesion) |
| POST | `/api/predictions` | Crear o actualizar prediccion |
| GET | `/api/leaderboard` | Obtener ranking de usuarios |
| POST | `/api/admin/results` | Guardar resultado y calcular puntos |
| GET/PUT | `/api/admin/scoring` | Leer/actualizar config de puntos |
| POST | `/api/admin/matches/lock` | Bloquear partido |

---

## Datos Precargados (Seed)

- **48 equipos** en 12 grupos (A-L): Mexico, USA, Argentina, Brasil, etc.
- **80 partidos** con fechas reales (11 junio - 19 julio 2026)
- **16 sedes** en USA, Mexico y Canada
- **1 configuracion de puntos** por defecto (5/3/2)

---

## Seguridad

- Passwords hasheados con **bcrypt** (10 salt rounds)
- Sesiones con **JWT** (no se almacenan en BD)
- Rutas admin protegidas por **verificacion de rol** en el layout
- API routes validan **sesion activa** antes de procesar
- Predicciones solo se aceptan si el partido esta en estado **"scheduled"**

---

## Resumen Ejecutivo

> Es una quiniela web donde los empleados/participantes predicen resultados del Mundial 2026. Cada quien pone su marcador antes de cada partido, y cuando el admin ingresa el resultado real, el sistema asigna puntos automaticamente. Todo se refleja en un leaderboard en tiempo real. La app soporta login con Google o email, tiene un panel de administracion para gestionar partidos y puntos, y esta construida con tecnologias modernas (Next.js, React, TypeScript, SQLite).
