import { pgTable, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";


export const instructorsSchema = pgTable('instructors',{
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
    .references(() => userSchema.id,{onDelete:'cascade'})
    .notNull()
})