import { pgTable, serial, varchar, integer, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Players table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true),
});

// Player characters/profiles
export const playerProfiles = pgTable('player_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  characterName: varchar('character_name', { length: 50 }).notNull(),
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  hitPoints: integer('hit_points').default(100),
  maxHitPoints: integer('max_hit_points').default(100),
  armor: integer('armor').default(0),
  weapon: integer('weapon').default(0),
  x: integer('x').default(0),
  y: integer('y').default(0),
  orientation: integer('orientation').default(2), // DOWN
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Game sessions
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  playerProfileId: integer('player_profile_id').references(() => playerProfiles.id),
  sessionStart: timestamp('session_start').defaultNow(),
  sessionEnd: timestamp('session_end'),
  playTime: integer('play_time_seconds').default(0),
  mobsKilled: integer('mobs_killed').default(0),
  itemsCollected: integer('items_collected').default(0),
  experienceGained: integer('experience_gained').default(0),
});

// Player inventory
export const playerInventory = pgTable('player_inventory', {
  id: serial('id').primaryKey(),
  playerProfileId: integer('player_profile_id').references(() => playerProfiles.id),
  itemType: integer('item_type').notNull(),
  itemKind: integer('item_kind').notNull(),
  quantity: integer('quantity').default(1),
  isEquipped: boolean('is_equipped').default(false),
  obtainedAt: timestamp('obtained_at').defaultNow(),
});

// Chat messages (for moderation and history)
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  playerProfileId: integer('player_profile_id').references(() => playerProfiles.id),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  worldId: varchar('world_id', { length: 50 }),
});

// Game statistics
export const gameStats = pgTable('game_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  totalPlayTime: integer('total_play_time_seconds').default(0),
  totalMobsKilled: integer('total_mobs_killed').default(0),
  totalItemsCollected: integer('total_items_collected').default(0),
  totalExperience: integer('total_experience').default(0),
  highestLevel: integer('highest_level').default(1),
  gamesPlayed: integer('games_played').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  playerProfiles: many(playerProfiles),
  gameSessions: many(gameSessions),
  chatMessages: many(chatMessages),
  gameStats: many(gameStats),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
  gameSessions: many(gameSessions),
  inventory: many(playerInventory),
  chatMessages: many(chatMessages),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  playerProfile: one(playerProfiles, {
    fields: [gameSessions.playerProfileId],
    references: [playerProfiles.id],
  }),
}));

export const playerInventoryRelations = relations(playerInventory, ({ one }) => ({
  playerProfile: one(playerProfiles, {
    fields: [playerInventory.playerProfileId],
    references: [playerProfiles.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  playerProfile: one(playerProfiles, {
    fields: [chatMessages.playerProfileId],
    references: [playerProfiles.id],
  }),
}));

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
  user: one(users, {
    fields: [gameStats.userId],
    references: [users.id],
  }),
}));

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type InsertPlayerProfile = typeof playerProfiles.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;
export type PlayerInventoryItem = typeof playerInventory.$inferSelect;
export type InsertPlayerInventoryItem = typeof playerInventory.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = typeof gameStats.$inferInsert;