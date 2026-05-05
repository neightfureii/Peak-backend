import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timestamps = {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
}

export const sports_categories = pgTable("sports_categories", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    ...timestamps
});

export const sports = pgTable("sports", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }),
    sports_category_id: integer("sports_category_id").references(() => sports_categories.id).notNull(),
    ...timestamps
});

export const sportsCategoryRelations = relations(sports_categories, ({ many }) => ({ sports: many(sports) }));

export const sportsRelations = relations(sports, ({ one, many }) => ({
    sportsCategory: one(sports_categories, {
        fields: [sports.sports_category_id],
        references: [sports_categories.id],
    }),
}));

export type SportsCategory = typeof sports_categories.$inferSelect;
export type NewSportsCategory = typeof sports_categories.$inferInsert;

export type Sport = typeof sports.$inferSelect;
export type NewSport = typeof sports.$inferInsert;