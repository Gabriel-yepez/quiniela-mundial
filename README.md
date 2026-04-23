## Quiniela Mundial

Aplicacion de quiniela del Mundial construida con Next.js + Prisma + PostgreSQL (Supabase).

## Configuracion de Supabase (Pooler)

1. Copia el archivo de ejemplo y completa tus credenciales:

```bash
cp .env.example .env.local
```

2. Configura estas variables:

- `DATABASE_URL`: URL del pooler de Supabase (runtime app).
- `DIRECT_URL`: URL para Prisma CLI con params `sslmode=require&sslaccept=accept_invalid_certs&pgbouncer=true`.

Ejemplo:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require&sslaccept=accept_invalid_certs&pgbouncer=true"
```

3. Instala dependencias y genera Prisma client:

```bash
npm install
npx prisma generate
```

4. (Opcional) Inicializa datos:

```bash
npm run seed
```

## Verificacion recomendada

```bash
npm run lint
npm run build
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
