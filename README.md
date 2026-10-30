# NomadShift (App Time)

A time and earnings tracker for casual and seasonal workers. I built it for a real problem: while working casual jobs I never knew how much I was going to be paid. NomadShift records your shifts, applies your hourly rate, taxes and contributions, and shows what you earned.

## Features

- **Track**: a live clock for the shift you're working now.
- **Fast charge**: log a finished shift in one go.
- **Production**: piece-rate shifts (item value × quantity) alongside hourly ones.
- **Employers**: who each shift was for, with details filled from official registers: Australia (ABN Lookup), New Zealand (NZBN) and the EU (VIES).
- **Taxes and contributions**: each user keeps their own. Editing one from a shift changes only that shift; editing it from Settings changes every shift that uses it.
- **Multi-currency**: a currency per shift plus a default one, with daily EUR-based exchange rates.
- **Dashboard, Incomes and Compare**: earnings summaries, history and charts.
- **Settings**: week start, default rate and breaks, holiday pay, theme (system, light or dark).
- **i18n**: English and Spanish.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, React Compiler), React 19, TypeScript |
| Data | Prisma 7 with the libSQL adapter. Local SQLite in development, Turso in production |
| Auth | Better Auth (email + password, Google) with database sessions |
| UI | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, Recharts |
| State and forms | TanStack Query, Zustand, React Hook Form + Zod |
| i18n | next-intl |
| Email | Resend (password reset) |
| Tests | Vitest + Testing Library (unit), Playwright (e2e) |
| Hosting | Vercel (with Analytics and Speed Insights) |

## Requirements

- Node.js 24 (see `.nvmrc`; `engineStrict` blocks installing with another major)
- pnpm 10
- [`dotenv-cli`](https://www.npmjs.com/package/dotenv-cli) installed globally (`pnpm add -g dotenv-cli`). Most scripts load `.env.local` through it.
- [Turso CLI](https://docs.turso.tech/cli/introduction), only if you apply migrations to Turso.

## Getting started

```bash
git clone https://github.com/MatataFerra/apptime.git
cd apptime
nvm use
pnpm install            # also runs `prisma generate`
cp .env.sample .env.local
```

Fill in `.env.local` (see [Environment variables](#environment-variables)), then create and seed the local database:

```bash
pnpm prisma:push        # creates prisma/apptime.db from the schema
pnpm prisma:seed
pnpm dev                # http://localhost:3000
```

To give a user the admin role: `pnpm admin:promote someone@example.com` (add `--revoke` to remove it). Nothing in the app grants it over HTTP.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `TURSO_ON` | yes | `true` uses Turso. Anything else uses the local SQLite file at `prisma/apptime.db`. |
| `TURSO_DATABASE_URL` | with Turso | `libsql://…` URL of the Turso database. |
| `TURSO_AUTH_TOKEN` | with Turso | Turso auth token. |
| `BETTER_AUTH_SECRET` | yes | Secret used to sign sessions. Falls back to `NEXTAUTH_SECRET`. |
| `BETTER_AUTH_URL` | yes | Base URL of the app, e.g. `http://localhost:3000`. Falls back to `NEXTAUTH_URL`. |
| `NEXT_PUBLIC_URL` | yes | Public URL of the app. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google sign-in | OAuth credentials. |
| `RESEND_API_KEY` | for password reset | Resend API key. |
| `RESEND_SENDER` | for password reset | Sender domain. Emails go out from `resetpassword@<domain>`. |
| `RESEND_SUBJECT` | no | Subject of the reset email. |
| `ABR_GUID` | for ABN lookup | Free GUID from [ABN Lookup web services](https://abr.business.gov.au/Tools/WebServices). |
| `NZBN_API_KEY` | for NZBN lookup | Free key from the [NZBN API portal](https://portal.api.business.govt.nz/api/nzbn). EU VAT (VIES) needs no key. |
| `NEXT_PUBLIC_SHOW_DEVTOOLS` | no | `true` shows the TanStack Query devtools. |
| `ANALYZE` | no | `true` runs `@next/bundle-analyzer` on build. |

`.env.testing` holds the values for the e2e tests.

## Database

The schema is in `prisma/schema.prisma` and migrations are in `prisma/migrations`. Prisma 7 reads the CLI config (local URL and seed command) from `prisma.config.ts`.

1. Create a migration locally: `pnpm prisma:migrate <name>`
2. Apply it to the Turso test database: `pnpm turso:migrate-dev <name>`
3. Apply it to the Turso production database: `pnpm turso:shell <name>`

Inspect data with `pnpm prisma:studio` (local) or `pnpm test:studio` (test database).

## Scripts

| Script | What it does |
| --- | --- |
| `dev` / `build` / `start` | Next.js dev server, production build, production server |
| `preview` | Build and start |
| `lint` / `eslint:fix` / `prettier:fix` | Linting and formatting |
| `typecheck` | `next typegen` + `tsc --noEmit` |
| `test` | Vitest with `.env.local` |
| `test:ci` | Vitest without an env file |
| `coverage` | Vitest with v8 coverage |
| `test:e2e` | Playwright with `.env.testing` (`test:seed` seeds that database first) |
| `prisma:push` / `prisma:migrate` / `prisma:seed` / `prisma:studio` | Local database |
| `turso:migrate-dev` / `turso:shell` | Apply a migration to Turso test / production |
| `admin:promote` | Grant or revoke the admin role |

## Project structure

```
src/
  app/[locale]/     pages: (auth) login and password reset, (home) the app, admin
  app/api/          route handlers (documented in swagger.json)
  components/       UI (shadcn/ui under components/ui)
  server-actions/   mutations: shifts, employers, taxes, settings, account
  services/         domain logic: exchange rates, business registers, errors…
  store/            Zustand stores
  proxy.ts          locale routing and auth redirects
messages/           en.json, es.json
prisma/             schema, migrations, seed, client
__test__/           unit tests
e2e/                Playwright tests
```

Mutations go through server actions. The REST endpoints under `/api` are read-only, apart from deleting shifts, updating the user and the waiting list. They are described in `swagger.json` (OpenAPI 3).
