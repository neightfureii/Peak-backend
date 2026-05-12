import { relations } from "drizzle-orm";
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

// Timestamps
const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  image: varchar("image", { length: 255 }),
  ...timestamps,
});

// Students
export const students = pgTable("students", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  registrationNumber: varchar("registration_number", { length: 15 }).unique().notNull(),
  faculty: varchar("faculty", { length: 50 }).notNull(),
  degree: varchar("degree", { length: 100 }),
  batch: varchar("batch", { length: 10 }),
  ...timestamps,
});

// Sports
export const sports_categories = pgTable("sports_categories", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    ...timestamps
});

export const sports = pgTable("sports", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    categoryId: integer("sports_category_id").references(() => sports_categories.id).notNull(),
    description: varchar("description", { length: 255 }),
    ...timestamps
});

// Players
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.userId, { onDelete: 'cascade' }).notNull(),
  sportId: integer("sport_id").references(() => sports.id, { onDelete: 'cascade' }).notNull(),
  position: varchar("position", { length: 100 }), // e.g., "Goalkeeper"
  ...timestamps,
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  playerEntries: many(players),
}));

export const sportsRelations = relations(sports, ({ one, many }) => ({
  category: one(sports_categories, { fields: [sports.categoryId], references: [sports_categories.id] }),
  playersList: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
  student: one(students, { fields: [players.studentId], references: [students.userId] }),
  sport: one(sports, { fields: [players.sportId], references: [sports.id] }),
}));

export const sportsCategoryRelations = relations(sports_categories, ({ many }) => ({ sports: many(sports) }));

export type SportsCategory = typeof sports_categories.$inferSelect;
export type NewSportsCategory = typeof sports_categories.$inferInsert;

export type Sport = typeof sports.$inferSelect;
export type NewSport = typeof sports.$inferInsert;