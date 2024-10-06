# App Time (or CasualApp)

This was created for real purposes. When I thought on this app it was for a real issue: I had no idea how much I was going to get paid. So far I created this app for tracking my work time.

## First Steps

- clone the repository
- create .env.local file and add every value founded into .env.sample
- run `pnpm install`

### Seed DB

1. run `pnpm prisma:generate` this script will generate the types for prisma (needs `dotenv` library)
2. run `pnpm prisma:migrate`
   a. This command will execute two bash scripts for migrate the database to your local enviroment
3. run `npx prisma db seed` for seeding your database or if you have an `.env.local` file (as usual) you can run `pnpm prisma:seed`
   a. Please ensure you have been install `dotenv-cli` library
4. Your enviroment is ready!
5. run `pnpm dev` to test the app


### Testing

1. For testing only run the `pnpm test` script. Please ensure you have been install `dotenv-cli` library

## Tech stack

This app was buit with
- Next.js 14.x
- Prisma as ORM 5.14
- Node.js: 20.9.0
- ShadcnUI for components
- TailwindCSS
- React-Query
- React-Hook-Form
- Next-Auth
- Next-Intl
- recharts
- zod
- zustand
- for testing: Vite, playwright
- helpers: lodash, date-fns
