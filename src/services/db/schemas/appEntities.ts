import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timpeStamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}

export const departments = pgTable('departments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    ...timpeStamps
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    ...timpeStamps
});

export const departmentRelation = relations(departments, ({ many }) => ({ subjects: many(subjects) }));

export const subjectsRelation = relations(subjects, ({ one, many }) => ({
    deparment: one(departments, {
        fields: [subjects.departmentId],
        references: [departments.id]
    })
}));

/**
 * This uses type inference from database table schemas, the app types always be in sync with the DB
 * Basically autogen types based on the db schemas so there is no need to define types manually 
 */
export type Deparment = typeof departments.$inferSelect;
export type NewDeparment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;