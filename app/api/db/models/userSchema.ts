 
 
import { sql } from "drizzle-orm";
import { integer, pgTable, uuid,text, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
    "STUDENT",
    "INSTRUCTOR",
    "ADMIN"
  ]);

export const userSchema = pgTable(
    'users',{
      id: uuid('id').defaultRandom().primaryKey(),
        name: text('name'),
        email: text('email').unique(),
        password: text("password").notNull(), 
        role: userRoleEnum('role').notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
        

    },
    (row) => ({
        emailCheck: sql`CHECK (${row.email} ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')`
      })
)