#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

cd "$ROOT_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
else
  echo ".env already exists, leaving it unchanged"
fi

echo "Installing dependencies..."
pnpm install

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker Desktop and run pnpm bootstrap again."
  exit 1
fi

echo "Starting PostgreSQL and Adminer..."
docker compose up -d

echo "Generating Prisma client..."
pnpm --dir backend prisma:generate

echo "Pushing Prisma schema to the database..."
pnpm --dir backend exec prisma db push

echo "Seeding the database..."
pnpm --dir backend prisma:seed

cat <<'EOF'

Bootstrap complete.

Next commands:
  pnpm start:backend
  pnpm start:frontend
  pnpm run:etl
EOF
