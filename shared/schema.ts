import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isParent: boolean("is_parent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").default("cat"),
  parentId: integer("parent_id").references(() => users.id),
  timeLimit: integer("time_limit").default(30), // minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").references(() => children.id),
  activityType: text("activity_type").notNull(), // 'music', 'coloring', 'photos'
  duration: integer("duration").notNull(), // seconds
  date: timestamp("date").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  alt: text("alt").notNull(),
  order: integer("order").default(0),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  audioUrl: text("audio_url"),
  order: integer("order").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  isParent: true,
});

export const insertChildSchema = createInsertSchema(children).pick({
  name: true,
  avatar: true,
  timeLimit: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  childId: true,
  activityType: true,
  duration: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Photo = typeof photos.$inferSelect;
export type Song = typeof songs.$inferSelect;
