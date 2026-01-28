 
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { instructorsSchema } from "./instructorsSchema";


export const courseSchema = pgTable('courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title'),
    description : text('description'),
    instructorId: uuid("instructor_id")
    .references(() => instructorsSchema.id)
    .notNull(),

    thumbnail: text('thumbnnail'),
    createdAt: timestamp("created_at").defaultNow().notNull()


})