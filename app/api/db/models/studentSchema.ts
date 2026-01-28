import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";
 



export const studentSchema = pgTable('students',{
    id: uuid('id').primaryKey(),
    userId: uuid('user_id').references(() => userSchema.id),
})

