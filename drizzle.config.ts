import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";
// import './app/api/db/models//allSchema'

config({ path: '.env' });

export default defineConfig({
  schema: "./app/api/db/models/allSchema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_DATABASE_URL!,
  },
});
