import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorName: text("author_name"),
  location: text("location"),
  likeCount: integer("like_count").default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  isReported: boolean("is_reported").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => messages.id).notNull(),
  userFingerprint: text("user_fingerprint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => messages.id).notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  userFingerprint: text("user_fingerprint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  authorName: true,
  location: true,
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  messageId: true,
  userFingerprint: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  messageId: true,
  reason: true,
  details: true,
  userFingerprint: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Message = typeof messages.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Report = typeof reports.$inferSelect;
