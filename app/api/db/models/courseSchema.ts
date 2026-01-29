 
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { instructorsSchema } from "./instructorsSchema";


export const courseSchema = pgTable('courses', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title'),
    description : text('description'),
    duration : text('duration'),
    prequisites : text('prequisites'),
    outcomes : text('outcomes'),
    price : integer('price'),
    category: text('category'),
    level: text('level'),


    instructorId: uuid("instructor_id")
    .references(() => instructorsSchema.id)
    .notNull(),

    thumbnail: text('thumbnnail'),
    createdAt: timestamp("created_at").defaultNow().notNull()


})