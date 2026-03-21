# Tilla V1

This repo contains:

- a NestJS backend in [`backend`](/Users/hanspet/Documents/tilla_v1/backend)
- a React + Vite frontend in [`frontend`](/Users/hanspet/Documents/tilla_v1/frontend)
- PostgreSQL + Adminer in [`docker-compose.yml`](/Users/hanspet/Documents/tilla_v1/docker-compose.yml)
- an ETL flow that pulls active integration files and writes seaport data into Postgres

This guide is written for someone testing the project for the first time.

## What You Need

Install these first:

- Node.js 22
- `pnpm` 10+
- Docker Desktop
- internet access

Internet is needed for:

- `pnpm install`
- Docker image pulls
- ETL access to remote integration storage, if the integration points to Azure blob storage or another live source

## 1. Open The Project

From your terminal route to where this repo is downloaded:

```bash
cd /__{pwd}__/tilla_v1
```

## 2. Install Dependencies

Run:

```bash
pnpm install
```

## 3. Create Env Files

At minimum, create a root `.env` file if not present and run the below:

```bash
cp .env.example .env
```

The default values are:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tilla_v1?schema=public"
PORT=3000
```

If your backend also expects a local env file, you can copy the same values into `backend/.env`.

## 4. Start Postgres And Adminer

From the repo root:

```bash
pnpm start:pg
```

This starts:

- PostgreSQL on `localhost:5432`
- Adminer on `http://localhost:8080`

Adminer login details:

- System: `PostgreSQL`
- Server: `postgres` if using Docker network from another container, or `localhost` from your host machine
- Username: `postgres`
- Password: `postgres`
- Database: `tilla_v1`

## 5. Run Prisma Migration

From the repo root:

```bash
pnpm --dir backend prisma:migrate
```

If Prisma asks for a migration name, use something simple like:

```text
init
```

This creates the schema in Postgres.

## 6. Start The Backend

From the repo root:

```bash
pnpm start:backend
```

The backend should start on:

```text
http://localhost:3000
```

GraphQL should be available at:

```text
http://localhost:3000/graphql
```

## 7. Start The Frontend

Open a second terminal in the repo root and run:

```bash
pnpm start:frontend
```

The frontend should start on:

```text
http://localhost:5173
```

## 8. Seed Or Prepare Data

The frontend is only useful if the database contains at least:

- one tenant
- one active integration linked to that tenant
- optional sync run data
- optional seaport data

If you already have a seed script in [`backend/prisma/seed.ts`](/Users/hanspet/Documents/tilla_v1/backend/prisma/seed.ts), run it using the method your project expects.

If not, you can still test the app after ETL runs successfully, as long as the database already contains tenants and active integrations.
```bash
pnpm --dir backend prisma:seed
```

## 9. Run The ETL

Open a third terminal and run:


```bash
pnpm --dir backend run-etl
```

What ETL does:

- loads active integrations
- fetches the source file from cloud storage
- transforms the records into seaports
- upserts seaports into the database
- writes sync run records

For ETL to actually load data, each active integration must have:

- `isActive = true`
- valid `source`, `sourceUrl`, `sourceToken`, and `sourceFileExtension`
- a correct `tillaToTenantMapping`

Important:

- if `tillaToTenantMapping` is empty or wrong, ETL may run but skip every row
- if your file source is remote, internet access must still be on during ETL

## 10. Test In The Browser

Open:

```text
http://localhost:5173
```

You should be able to:

- select a tenant
- select one of that tenant's active integrations
- see the latest sync run summary
- page through seaports 20 records at a time

The frontend now starts in light mode by default and has a dark mode toggle.

## Useful Commands

From repo root:

```bash
pnpm start:pg
pnpm start:backend
pnpm start:frontend
pnpm build
pnpm prisma:generate
```

Backend-specific:

```bash
pnpm --dir backend prisma:migrate
pnpm --dir backend build
pnpm --dir backend start
```

## Quick Test Order

If you just want the shortest happy path:

1. `pnpm install`
2. `cp .env.example .env: only if .env is not present`
3. `pnpm start:pg`
4. `pnpm --dir backend prisma:migrate`
5. `pnpm --dir backend prisma:seed`
6. `pnpm start:backend`
7. `pnpm start:frontend`
8. `pnpm --dir backend run-etl`
9. open `http://localhost:5173`

## Troubleshooting

### Backend starts but frontend shows placeholders

This usually means:

- there are no tenants
- there are no active integrations
- ETL has not run yet
- ETL ran but skipped all rows because the mapping is wrong

### ETL runs but no seaports are created

Check:

- the integration is active
- the remote file is reachable
- `tillaToTenantMapping` points to the actual file column names
- the source rows contain values for locode, port name, latitude, and longitude

### Prisma cannot connect

Make sure Docker is running and Postgres is up:

```bash
docker ps
```

You should see the `tilla-postgres` container.

### GraphQL endpoint does not respond

Make sure the backend is running and listening on port `3000`.

### Port already in use

Stop the process using that port or change the port in `.env`.

## Notes

- The backend uses Prisma with PostgreSQL.
- The frontend uses Vite.
- Adminer is only for easy database inspection while testing.
