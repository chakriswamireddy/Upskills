import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@/app/api/db/models/allSchema'

config({ path: ".env" }); // or .env.local

export const db = drizzle(process.env.NEXT_DATABASE_URL!, {schema});
