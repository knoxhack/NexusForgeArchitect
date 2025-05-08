import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (from original file)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  relatedProjects: json("related_projects").$type<string[]>().default([]),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  description: true,
  type: true,
  relatedProjects: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// AI personas schema
export const aiPersonas = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
});

export const insertAIPersonaSchema = createInsertSchema(aiPersonas).pick({
  name: true,
  description: true,
  color: true,
});

export type InsertAIPersona = z.infer<typeof insertAIPersonaSchema>;
export type AIPersona = typeof aiPersonas.$inferSelect;

// AI messages schema
export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  personaId: integer("persona_id").references(() => aiPersonas.id),
});

export const insertAIMessageSchema = createInsertSchema(aiMessages).pick({
  content: true,
  role: true,
  personaId: true,
});

export type InsertAIMessage = z.infer<typeof insertAIMessageSchema>;
export type AIMessage = typeof aiMessages.$inferSelect;
