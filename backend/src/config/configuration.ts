const defaultDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5432/tilla_v1?schema=public';

export default () => ({
  app: {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  },
});
