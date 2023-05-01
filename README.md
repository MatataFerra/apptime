# App Time

This was created for real porpouses. When I think this app it was for a real issue: I have no idea how much I'm going to get payed. So far I created this app for tracking my time.

## First Steps

### Initialize DB with Docker Compose

The files are already in the repo, you need to run this commands

1. `docker compose -f "docker-compose.yml" up -d --build --remove-orphans`

### Install dependencies and seed DB

1. run `npm i` / `yarn install` / `pnpm install`
2. complete the .env variables
3. run `npx prisma db seed` for seeding your database

### Testing

1. For testing only run the `test` script. Please ensure you have been install dotenv-cli library
