import { relations, sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth.ts";

// Timestamps
const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}

// Students
export const students = pgTable("students", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  registrationNumber: varchar("registration_number", { length: 15 }).unique().notNull(),
  faculty: varchar("faculty", { length: 50 }).notNull(),
  degree: varchar("degree", { length: 100 }),
  batch: varchar("batch", { length: 10 }),
  ...timestamps,
});

// Sports
export const sports_categories = pgTable("sports_categories", {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    ...timestamps
});

export const sports = pgTable("sports", {
    id: text("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    categoryId: text("sports_category_id").references(() => sports_categories.id).notNull(),
    description: varchar("description", { length: 255 }),
    bannerUrl: text("banner_url"),
    bannerCldPubId: text("banner_cld_pub_id"),
    ...timestamps
});

// Players
export const players = pgTable("players", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").references(() => students.userId, { onDelete: 'cascade' }).notNull(),
  sportId: text("sport_id").references(() => sports.id, { onDelete: 'cascade' }).notNull(),
  position: varchar("position", { length: 100 }), // e.g., "Goalkeeper"
  ...timestamps,
});

// Relations
export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(user, { fields: [students.userId], references: [user.id] }),
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