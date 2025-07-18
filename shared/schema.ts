import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("player"),
  permissions: jsonb("permissions").default('{}'),
  assignedBy: integer("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetId: integer("target_id").references(() => users.id),
  details: jsonb("details").default('{}'),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const gameFiles = pgTable("game_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'script', 'map', 'config', 'asset'
  permissions: jsonb("permissions").default('{}'),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const npcs = pgTable("npcs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'merchant', 'guard', 'quest', 'enemy'
  position: jsonb("position").notNull(),
  mapId: text("map_id").notNull(),
  dialogue: jsonb("dialogue").default('{}'),
  stats: jsonb("stats").default('{}'),
  appearance: jsonb("appearance").default('{}'),
  script: text("script"), // JavaScript code for NPC behavior
  createdBy: integer("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  permissions: true,
});

export const insertAdminActionSchema = createInsertSchema(adminActions);
export const insertGameFileSchema = createInsertSchema(gameFiles);
export const insertNpcSchema = createInsertSchema(npcs);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AdminAction = typeof adminActions.$inferSelect;
export type GameFile = typeof gameFiles.$inferSelect;
export type NPC = typeof npcs.$inferSelect;
