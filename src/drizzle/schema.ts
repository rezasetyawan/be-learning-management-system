import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  smallserial,
  text,
  varchar,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';

export const academyModuleTypesEnum = pgEnum('module_types', [
  'LESSON',
  'QUIZZ',
  'SUBMISSION',
]);

export const userSubmissionStatus = pgEnum('submisssion_status', [
  'PENDING',
  'REVIEW',
  'REVIEWED',
]);

export const academyApplicationStatus = pgEnum('academy_application_status', [
  'PENDING',
  'APPROVED',
  'REJECTED',
]);

export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  fullname: text('full_name').notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('user'),
  createdAt: varchar('created_at', { length: 50 })
    .default(Date.now().toString())
    .notNull(),
  updatedAt: varchar('updated_at', { length: 50 })
    .default(Date.now().toString())
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  discussions: many(moduleDiscussions),
  academyApplications: many(academyApplications),
}));

export const academies = pgTable('academies', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  description: text('description').notNull().default(' '),
  isPublished: boolean('is_published').default(false),
  coverImageUrl: text('cover_image_url').default(''),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: varchar('deleted_at', { length: 50 }).default(null),
  deletedBy: varchar('deleted_by', { length: 50 }).references(() => users.id, {
    onDelete: 'cascade',
  }),
});

export const academiesRelations = relations(academies, ({ many, one }) => ({
  moduleGroups: many(academyModuleGroups),
  user: one(users, {
    fields: [academies.deletedBy],
    references: [users.id],
  }),
  academyApplications: many(academyApplications),
  userProgress: many(userProgress),
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
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: varchar('deleted_at', { length: 50 }).default(null),
  deletedBy: varchar('deleted_by', { length: 50 }).references(() => users.id, {
    onDelete: 'cascade',
  }),
});

export const academyModuleGroupsRelations = relations(
  academyModuleGroups,
  ({ one, many }) => ({
    academy: one(academies, {
      fields: [academyModuleGroups.academyId],
      references: [academies.id],
    }),
    modules: many(academyModules),
    user: one(users, {
      fields: [academyModuleGroups.deletedBy],
      references: [users.id],
    }),
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
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: varchar('deleted_at', { length: 50 }).default(null),
  deletedBy: varchar('deleted_by', { length: 50 }).references(() => users.id, {
    onDelete: 'cascade',
  }),
});

export const academyModulesRelations = relations(
  academyModules,
  ({ one, many }) => ({
    group: one(academyModuleGroups, {
      fields: [academyModules.academyModuleGroupId],
      references: [academyModuleGroups.id],
    }),
    discussions: many(moduleDiscussions),
    user: one(users, {
      fields: [academyModules.deletedBy],
      references: [users.id],
    }),
  }),
);

export const quizzes = pgTable('quizzes', {
  id: varchar('id', { length: 50 }).primaryKey(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  moduleId: varchar('module_id', { length: 50 })
    .references(() => academyModules.id, { onDelete: 'cascade' })
    .notNull(),
  duration: smallserial('duration'),
  isDeleted: boolean('is_deleted').default(false),
  questionAmounts: smallserial('question_amounts'),
});

export const quizzesRelations = relations(quizzes, ({ many, one }) => ({
  questions: many(quizzQuestions),
  module: one(academyModules, {
    fields: [quizzes.moduleId],
    references: [academyModules.id],
  }),
}));

export const quizzQuestions = pgTable('quizz_questions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  quizzId: varchar('quizz_id', { length: 500 })
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull().default(''),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: varchar('deleted_at', { length: 50 }).default(null),
});

export const quizzQuestionsReLATIONS = relations(
  quizzQuestions,
  ({ many, one }) => ({
    answers: many(quizzAnswerChoices),
    quizz: one(quizzes, {
      fields: [quizzQuestions.quizzId],
      references: [quizzes.id],
    }),
  }),
);

export const quizzAnswerChoices = pgTable('quizz_answer_choices', {
  id: varchar('id', { length: 50 }).primaryKey(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  questionId: varchar('question_id', { length: 500 })
    .references(() => quizzQuestions.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull().default(''),
  isCorrect: boolean('is_correct').notNull().default(false),
  isDeleted: boolean('is_deleted').default(false),
  deletedAt: varchar('deleted_at', { length: 50 }).default(null),
});

export const quizzAnswerChoicesRelations = relations(
  quizzAnswerChoices,
  ({ one }) => ({
    questions: one(quizzQuestions, {
      fields: [quizzAnswerChoices.questionId],
      references: [quizzQuestions.id],
    }),
  }),
);

// TODO: UNIQUE OF OTH USER ID AND MODULE ID
export const userModuleLastRead = pgTable('user_module_last_read', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 500 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  academyId: varchar('academy_id', { length: 500 })
    .references(() => academies.id, { onDelete: 'cascade' })
    .notNull(),
  moduleGroupId: varchar('module_group_id', { length: 500 })
    .references(() => academyModuleGroups.id, { onDelete: 'cascade' })
    .notNull(),
  moduleId: varchar('module_id', { length: 500 })
    .references(() => academyModules.id, { onDelete: 'cascade' })
    .notNull(),
});

export const userModuleLastReadRelations = relations(
  userModuleLastRead,
  ({ one }) => ({
    user: one(users, {
      fields: [userModuleLastRead.userId],
      references: [users.id],
    }),
    academy: one(academies, {
      fields: [userModuleLastRead.academyId],
      references: [academies.id],
    }),
    moduleGroupId: one(academyModuleGroups, {
      fields: [userModuleLastRead.moduleGroupId],
      references: [academyModuleGroups.id],
    }),
    module: one(academyModules, {
      fields: [userModuleLastRead.moduleId],
      references: [academyModules.id],
    }),
  }),
);

export const userQuizzHistories = pgTable('user_quizz_histories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  moduleId: varchar('module_id', { length: 50 })
    .references(() => academyModules.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  score: smallserial('score').notNull(),
});

export const userQuizzHistoriesRelations = relations(
  userQuizzHistories,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userQuizzHistories.userId],
      references: [users.id],
    }),
    module: one(academyModules, {
      fields: [userQuizzHistories.moduleId],
      references: [academyModules.id],
    }),
    answers: many(userQuizzAnswerHistories),
  }),
);

export const userQuizzAnswerHistories = pgTable('user_quizz_answer_histories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  quizzHistoryId: varchar('quizz_history_id', { length: 50 })
    .references(() => userQuizzHistories.id, { onDelete: 'cascade' })
    .notNull(),
  questionId: varchar('question_id', { length: 50 })
    .references(() => quizzQuestions.id, { onDelete: 'cascade' })
    .notNull(),
  answerId: varchar('answer_id', { length: 50 })
    .references(() => quizzAnswerChoices.id, { onDelete: 'cascade' })
    .notNull(),
});

export const userQuizzAnswerHistoriesRelations = relations(
  userQuizzAnswerHistories,
  ({ one }) => ({
    userQuizzHistory: one(userQuizzHistories, {
      fields: [userQuizzAnswerHistories.quizzHistoryId],
      references: [userQuizzHistories.id],
    }),
    question: one(quizzQuestions, {
      fields: [userQuizzAnswerHistories.questionId],
      references: [quizzQuestions.id],
    }),
    answer: one(quizzAnswerChoices, {
      fields: [userQuizzAnswerHistories.answerId],
      references: [quizzAnswerChoices.id],
    }),
  }),
);

export const moduleDiscussions = pgTable('module_discussions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  moduleId: varchar('module_id', { length: 50 })
    .references(() => academyModules.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  title: text('title').default(''),
  body: text('body').default(''),
  isSolved: boolean('is_solved').default(false),
  academyId: varchar('academy_id', { length: 50 })
    .references(() => academies.id, { onDelete: 'cascade' })
    .notNull(),
});

export const moduleDiscussionsRelations = relations(
  moduleDiscussions,
  ({ one, many }) => ({
    module: one(academyModules, {
      fields: [moduleDiscussions.moduleId],
      references: [academyModules.id],
    }),
    replies: many(moduleDiscussionReplies),
    academy: one(academies, {
      fields: [moduleDiscussions.academyId],
      references: [academies.id],
    }),
    user: one(users, {
      fields: [moduleDiscussions.userId],
      references: [users.id],
    }),
  }),
);

export const moduleDiscussionReplies = pgTable('module_discussion_replies', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  discussionId: varchar('discussion_id', { length: 50 })
    .references(() => moduleDiscussions.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  body: text('body').default(''),
});

export const moduleDiscussionRepliesRelations = relations(
  moduleDiscussionReplies,
  ({ one }) => ({
    discussion: one(moduleDiscussions, {
      fields: [moduleDiscussionReplies.discussionId],
      references: [moduleDiscussions.id],
    }),
    user: one(users, {
      fields: [moduleDiscussionReplies.userId],
      references: [users.id],
    }),
  }),
);

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  actionType: varchar('action_type', { length: 20 }),
  entityType: text('entity_type'),
  entityName: text('entity_name'),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const userSubmissions = pgTable('user_submissions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  note: text('note'),
  academyId: varchar('academy_id', { length: 50 })
    .references(() => academies.id, { onDelete: 'cascade' })
    .notNull(),
  moduleId: varchar('module_id', { length: 50 })
    .references(() => academyModules.id, { onDelete: 'cascade' })
    .notNull(),
  fileUrl: text('file_url'),
  status: userSubmissionStatus('status').notNull().default('PENDING'),
});

export const userSubmissionsRelations = relations(
  userSubmissions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [userSubmissions.userId],
      references: [users.id],
    }),
    academy: one(academies, {
      fields: [userSubmissions.academyId],
      references: [academies.id],
    }),
    module: one(academyModules, {
      fields: [userSubmissions.moduleId],
      references: [academyModules.id],
    }),
    result: many(userSubmissionResults),
  }),
);

export const userSubmissionResults = pgTable('user_submission_results', {
  id: varchar('id', { length: 50 }).primaryKey(),
  reviewer: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  reviewerNote: text('reviewer_note'),
  score: smallserial('score'),
  isPassed: boolean('is_passed'),
  submissionId: varchar('submission_ID', { length: 50 })
    .references(() => userSubmissions.id, { onDelete: 'cascade' })
    .notNull(),
});

export const userSubmissionResultsRelations = relations(
  userSubmissionResults,
  ({ one }) => ({
    reviewer: one(users, {
      fields: [userSubmissionResults.reviewer],
      references: [users.id],
    }),
    submission: one(userSubmissions, {
      fields: [userSubmissionResults.submissionId],
      references: [userSubmissions.id],
    }),
  }),
);

export const academyApplications = pgTable('academy_applications', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  academyId: varchar('academy_id', { length: 50 })
    .references(() => academies.id, { onDelete: 'cascade' })
    .notNull(),
  status: academyApplicationStatus('status').notNull().default('PENDING'),
  message: text('message').default(''),
  createdAt: varchar('created_at', { length: 50 }).notNull(),
  updatedAt: varchar('updated_at', { length: 50 }).notNull(),
});

export const academyApplicationsRelations = relations(
  academyApplications,
  ({ one }) => ({
    user: one(users, {
      fields: [academyApplications.userId],
      references: [users.id],
    }),
    academy: one(academies, {
      fields: [academyApplications.academyId],
      references: [academies.id],
    }),
  }),
);

export const userProgress = pgTable(
  'user_progress',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    userId: varchar('user_id', { length: 50 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    academyId: varchar('academy_id', { length: 50 })
      .references(() => academies.id, { onDelete: 'cascade' })
      .notNull(),
    moduleId: varchar('module_id', { length: 50 })
      .references(() => academyModules.id, { onDelete: 'cascade' })
      .notNull(),
    isCompleted: boolean('is_completed').default(false),
    createdAt: varchar('created_at', { length: 50 }).notNull(),
    updatedAt: varchar('updated_at', { length: 50 }).notNull(),
  },
  (t) => ({
    userId_moduleId: unique().on(t.userId, t.moduleId),
  }),
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  academy: one(academies, {
    fields: [userProgress.academyId],
    references: [academies.id],
  }),
}));
export type NewUser = typeof users.$inferInsert;
