import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  smallserial,
  text,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core';

export const academyModuleTypesEnum = pgEnum('module_types', [
  'LESSON',
  'QUIZZ',
  'SUBMISSION',
]);

export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  fullname: text('full_name').notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
});

export const academies = pgTable('academies', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  description: text('description').notNull().default(' '),
  isPublished: boolean('is_published').default(false),
  coverImageUrl: text('cover_image_url').default(''),
});

export const academiesRelations = relations(academies, ({ many }) => ({
  moduleGroups: many(academyModuleGroups),
}));

export const academyModuleGroups = pgTable('academy_module_groups', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  order: smallserial('order').notNull(),
  academyId: varchar('academy_id', { length: 50 })
    .references(() => academies.id, { onDelete: 'cascade' })
    .notNull(),
  isPublished: boolean('is_published').default(true),
  // isComplete: boolean('is_complete').default(false),
});

export const academyModuleGroupsRelations = relations(
  academyModuleGroups,
  ({ one, many }) => ({
    academy: one(academies, {
      fields: [academyModuleGroups.academyId],
      references: [academies.id],
    }),
    modules: many(academyModules),
  }),
);

export const academyModules = pgTable('academy_modules', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  order: smallserial('order').notNull(),
  academyModuleGroupId: varchar('academy_module_group_id', { length: 50 })
    .references(() => academyModuleGroups.id, { onDelete: 'cascade' })
    .notNull(),
  type: academyModuleTypesEnum('module_types').notNull().default('LESSON'),
  content: text('content').notNull().default(''),
  isPublished: boolean('is_published').default(true),
  // isComplete: boolean('is_complete').default(false),
});

export const academyModulesRelations = relations(academyModules, ({ one }) => ({
  group: one(academyModuleGroups, {
    fields: [academyModules.academyModuleGroupId],
    references: [academyModuleGroups.id],
  }),
}));

// export const authentications = pgTable('authentications', {
//   id: varchar('id', { length: 50 }).primaryKey(),
//   token: text('token').notNull().unique(),
// });

export type NewUser = typeof users.$inferInsert;
