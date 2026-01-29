import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";
 



export const studentSchema = pgTable('students',{
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => userSchema.id, {onDelete:'cascade'}),
    bio: text('bio')
})

