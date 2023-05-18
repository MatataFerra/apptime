# App Time

This was created for real porpouses. When I think this app it was for a real issue: I have no idea how much I'm going to get payed. So far I created this app for tracking my time.

## First Steps

### Initialize DB with Docker Compose

The files are already in the repo, you need to run this commands

- `docker compose -f "docker-compose.yml" up -d --build --remove-orphans`
- or just run the script `yarn compose`
- Finally you can get the Database initialized and also PgAdmin
- Enter to `localhost` to config PgAdmin
  - user: admin@admin.com
  - password: admin
- There is a flexible way to see the data in your database wich is `npx prisma studio` but if you have a .env.development file (wich I recommended) you need only execute `yarn prisma:studio` (needs dotenv library)

### Install dependencies and seed DB

1. run `npm i` / `yarn install` / `pnpm install`
2. complete the .env variables (better for local in a .env.development file)
3. run `yarn prisma:generate` this script will generate the types for prisma (needs dotenv library)
4. run `yarn prisma:migrate`
   1. This command will execute two bash scripts for migrate the database to your local enviroment
5. run `npx prisma db seed` for seeding your database or if you have an `.env.development` file (as usual) you can run `yarn prisma:seed`
   1. Please ensure you have been install dotenv-cli library
6. Your enviroment is ready!
7. run `yarn dev` to test the app

### Scripts

Above I writed about some scripts, first at all there are only tree:
- **access.sh** (at the root project)
  - This granted chmod access to all scripts in the respective folder
- **./scripts/curl.sh**
  - This script allows you to test GET request in your terminal here is an example: `yarn curl user` this execute curl `http://localhost:3000/api/user` the user in yarn curl user is an argument for the api endpoint
- **./scripts/prisma-migrate.sh**
  - this script will migrate your database for you, will take the .env.development file avoiding dotenv library
  - It's mandatory give a migration name, if you not provide it, the bash will give you an error.

### Testing

1. For testing only run the `test` script. Please ensure you have been install dotenv-cli library
2. We are working in the test, you can only test the prisma entities
