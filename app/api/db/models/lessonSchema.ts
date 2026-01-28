 
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { courseSchema } from "./courseSchema";

export const lessons = pgTable("lessons", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    videoUrl: text('video'),
    description : text('description'),
    courseId: uuid("course_id")
      .references(() => courseSchema.id,{onDelete:'cascade'})
      .notNull(),  
  
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()

  });
  