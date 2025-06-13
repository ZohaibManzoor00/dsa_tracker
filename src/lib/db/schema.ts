import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
  json,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Problems table - stores the base problem information
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(), // Easy, Medium, Hard
  topic: varchar("topic", { length: 100 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  description: text("description").notNull(),
  examples: json("examples").notNull(), // JSON string
  constraints: json("constraints").notNull(), // JSON string
  starterCode: text("starter_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User problems table - tracks user-specific problem data
export const userProblems = pgTable(
  "user_problems",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    problemId: integer("problem_id")
      .references(() => problems.id)
      .notNull(),
    status: text("status").notNull(), // Not Started, Attempted, Solved
    rating: integer("rating"), // 1-10 rating
    notes: text("notes"),
    lastAttempt: timestamp("last_attempt"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      // Ensure a user can only have one entry per problem
      userProblemUnique: unique().on(table.userId, table.problemId),
    };
  }
);

// Code snippets table - stores user's solutions
export const codeSnippets = pgTable("code_snippets", {
  id: serial("id").primaryKey(),
  userProblemId: integer("user_problem_id")
    .references(() => userProblems.id)
    .notNull(),
  caption: text("caption"),
  code: text("code").notNull(),
  timeComplexity: text("time_complexity"),
  spaceComplexity: text("space_complexity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attempt history table - tracks each attempt at solving a problem
export const attemptHistory = pgTable("attempt_history", {
  id: serial("id").primaryKey(),
  userProblemId: integer("user_problem_id")
    .references(() => userProblems.id)
    .notNull(),
  date: timestamp("date").defaultNow(),
  duration: integer("duration"), // in minutes
  status: text("status").notNull(), // Failed, Partial, Solved
  approach: text("approach"),
  notes: text("notes"),
});

// Relations
export const problemsRelations = relations(problems, ({ many }) => ({
  userProblems: many(userProblems),
}));

export const userProblemsRelations = relations(
  userProblems,
  ({ one, many }) => ({
    problem: one(problems, {
      fields: [userProblems.problemId],
      references: [problems.id],
    }),
    codeSnippets: many(codeSnippets),
    attemptHistory: many(attemptHistory),
  })
);

export const codeSnippetsRelations = relations(codeSnippets, ({ one }) => ({
  userProblem: one(userProblems, {
    fields: [codeSnippets.userProblemId],
    references: [userProblems.id],
  }),
}));

export const attemptHistoryRelations = relations(attemptHistory, ({ one }) => ({
  userProblem: one(userProblems, {
    fields: [attemptHistory.userProblemId],
    references: [userProblems.id],
  }),
}));
