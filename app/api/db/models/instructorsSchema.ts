import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";


export const instructorsSchema = pgTable('instructors', {
    id: uuid('id').defaultRandom().primaryKey(),
    bio: text('bio'),
    userId: uuid('user_id')
        .references(() => userSchema.id, { onDelete: 'cascade' })
        .notNull()
})