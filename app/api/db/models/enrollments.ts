import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { studentSchema } from "./studentSchema";
import { courseSchema } from "./courseSchema";

export const enrollments = pgTable('enrollments', {
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    studentId: uuid("student_id")
        .references(() => studentSchema.id)
        .notNull(),

    courseId: uuid("course_id")
        .references(() => courseSchema.id)
        .notNull()
},
    (table) => ({
        uniqueEnroll: unique().on(table.studentId, table.courseId)
    })

);

