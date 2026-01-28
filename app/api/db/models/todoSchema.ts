import { integer, text, boolean, pgTable, uuid } from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text("text").notNull(),
  done: boolean("done").default(false).notNull(),
});
