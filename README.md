# ETL V1

This repo contains:

- a NestJS backend in `[backend](/Users/hanspet/Documents/tilla_v1/backend)`
- a React + Vite frontend in `[frontend](/Users/hanspet/Documents/tilla_v1/frontend)`
- PostgreSQL + Adminer in `[docker-compose.yml](/Users/hanspet/Documents/tilla_v1/docker-compose.yml)`
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

If you want the fastest setup path, you can use the bootstrap script instead:

```bash
pnpm bootstrap
```

That command will:

- create `.env` from `.env.example` if needed
- install dependencies
- start PostgreSQL and Adminer
- generate Prisma client files
- push the Prisma schema to the database
- seed the database
- run ETL

After bootstrap finishes, start the app with:

```bash
pnpm start:backend
pnpm start:frontend
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
- sync run data
- seaport data

If you already have a seed script in `[backend/prisma/seed.ts](/Users/hanspet/Documents/tilla_v1/backend/prisma/seed.ts)`, run it using the method your project expects.

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

## Production Considerations

Before shipping this to production, these are the main edge cases and scaling concerns to handle.

### Edge Cases To Cover Before Shipping

- ETL idempotency: repeated ETL runs should not create duplicate seaports or inconsistent sync-run records.
- Invalid tenant mappings: empty or incorrect `tillaToTenantMapping` values should fail clearly and be easy to debug.
- Partial ETL failures: one broken tenant or integration should not stop the entire ETL process.
- Large source files: avoid loading very large files fully into memory if they can grow over time.
- Dirty source data: handle malformed locodes, missing coordinates, duplicates, bad encodings, and unexpected column names.
- Pagination consistency: cursor pagination should remain stable even while new rows are being inserted.
- Empty states: no tenants, no active integrations, no sync runs, or no seaport rows should all render gracefully.
- Cloud storage failure handling: add retries, timeouts, and better error reporting for remote file fetches.
- Secret handling: source tokens and credentials should never appear in logs, error messages, or exposed API responses.
- Concurrency control: prevent overlapping ETL runs for the same tenant and integration from racing each other.
- Database safety: use the right indexes, transactions, and constraints around the ETL write path.
- Authentication and authorization: tenant-scoped access control should be in place before exposing this publicly.
- Observability: structured logs, metrics, tracing, health checks, and alerts are important before go-live.

### How To Scale This For High Traffic

- separate the API workload from ETL workers so reads and ingestion do not compete directly
- scale the backend horizontally behind a load balancer
- add connection pooling and proper indexing in PostgreSQL
- use read replicas if read-heavy traffic grows significantly
- cache common GraphQL reads such as tenants, active integrations, and sync summaries
- keep cursor pagination backed by stable indexed fields
- prefer a push-based ingestion system instead of polling remote sources
- let tenants upload files directly into managed object storage
- trigger notifications when a new file lands in storage
- start ETL automatically from that storage event instead of repeatedly checking for files
- place storage events onto a queue so ETL workers can process them reliably and retry failures safely
- enforce worker concurrency limits and per-tenant throttling
- precompute or materialize heavy reporting views if dashboard complexity grows
- host the Vite frontend as static assets behind a CDN
- on AWS, a practical path would be:
- frontend on S3 + CloudFront
- backend API on ECS Fargate behind an ALB
- tenant uploads pushed into S3
- S3 event notifications sent to SQS or EventBridge
- ETL workers on separate ECS tasks consuming those events
- PostgreSQL on Amazon RDS
- Redis on ElastiCache
- secrets in Secrets Manager
- logs and alarms in CloudWatch

## Remote Team Values

For a fully remote team, the things that matter most here are:

- clear communication so progress, blockers, and decisions are visible
- solid planning so priorities, scope, and ownership are understood early
- trust so people can work independently and still stay aligned
- accountability so work gets done and risks are raised early
- strong written context through tickets, docs, and handoffs
