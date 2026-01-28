 
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { courseSchema } from "./courseSchema";

export const lessons = pgTable("lessons", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    video: text('video'),
    description : text('description'),
    courseId: uuid("course_id")
      .references(() => courseSchema.id)
      .notNull(),  
  
    order: integer("order"),
    createdAt: timestamp("created_at").defaultNow().notNull()

  });
  