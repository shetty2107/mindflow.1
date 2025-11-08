import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Study Plans table
export const studyPlans = pgTable("study_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  customSubject: text("custom_subject"),
  availableHours: integer("available_hours").notNull(),
  challenges: text("challenges").array().notNull().default(sql`ARRAY[]::text[]`),
  rawTasks: text("raw_tasks").notNull(),
  aiGeneratedPlan: text("ai_generated_plan").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudyPlanSchema = createInsertSchema(studyPlans).omit({
  id: true,
  createdAt: true,
  userId: true,
  aiGeneratedPlan: true,
}).extend({
  availableHours: z.number().min(1).max(24),
  challenges: z.array(z.string()),
  rawTasks: z.string().min(3, "Tell us what you need to study"),
});

export type InsertStudyPlan = z.infer<typeof insertStudyPlanSchema>;
export type StudyPlan = typeof studyPlans.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planId: varchar("plan_id"),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"),
  completed: boolean("completed").notNull().default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "Task title is required"),
  priority: z.enum(["low", "medium", "high"]),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Study Sessions table
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planId: varchar("plan_id"),
  taskId: varchar("task_id"),
  duration: integer("duration").notNull(),
  focusLevel: integer("focus_level"),
  notes: text("notes"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  startedAt: true,
}).extend({
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  focusLevel: z.number().min(1).max(10).optional(),
});

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

// Emotions/Mood tracking table
export const emotions = pgTable("emotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  emotion: text("emotion").notNull(),
  intensity: integer("intensity").notNull(),
  context: text("context"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

export const insertEmotionSchema = createInsertSchema(emotions).omit({
  id: true,
  recordedAt: true,
  userId: true,
}).extend({
  emotion: z.enum(["stressed", "calm", "motivated", "overwhelmed", "confident", "anxious"]),
  intensity: z.number().min(1).max(5),
});

export type InsertEmotion = z.infer<typeof insertEmotionSchema>;
export type Emotion = typeof emotions.$inferSelect;

// User Stats for Gamification
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
  totalStudyTime: integer("total_study_time").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  plansCreated: integer("plans_created").notNull().default(0),
});

export type UserStats = typeof userStats.$inferSelect;
