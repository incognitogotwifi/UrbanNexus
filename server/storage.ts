import { users, playerProfiles, gameSessions, playerInventory, chatMessages, gameStats, 
         type User, type InsertUser, type PlayerProfile, type InsertPlayerProfile,
         type GameSession, type InsertGameSession, type PlayerInventoryItem, type InsertPlayerInventoryItem,
         type ChatMessage, type InsertChatMessage, type GameStats, type InsertGameStats } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createPlayerProfile(insertProfile: InsertPlayerProfile): Promise<PlayerProfile>;
  getPlayerProfile(userId: number): Promise<PlayerProfile | undefined>;
  updatePlayerProfile(id: number, updates: Partial<PlayerProfile>): Promise<void>;
  savePlayerSession(session: InsertGameSession): Promise<GameSession>;
  updatePlayerInventory(profileId: number, items: InsertPlayerInventoryItem[]): Promise<void>;
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateGameStats(userId: number, updates: Partial<GameStats>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createPlayerProfile(insertProfile: InsertPlayerProfile): Promise<PlayerProfile> {
    const [profile] = await db
      .insert(playerProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async getPlayerProfile(userId: number): Promise<PlayerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, userId))
      .orderBy(desc(playerProfiles.createdAt));
    return profile || undefined;
  }

  async updatePlayerProfile(id: number, updates: Partial<PlayerProfile>): Promise<void> {
    await db
      .update(playerProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(playerProfiles.id, id));
  }

  async savePlayerSession(session: InsertGameSession): Promise<GameSession> {
    const [savedSession] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return savedSession;
  }

  async updatePlayerInventory(profileId: number, items: InsertPlayerInventoryItem[]): Promise<void> {
    // Clear existing inventory for this profile
    await db
      .delete(playerInventory)
      .where(eq(playerInventory.playerProfileId, profileId));
    
    // Insert new inventory items
    if (items.length > 0) {
      await db.insert(playerInventory).values(items);
    }
  }

  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [savedMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return savedMessage;
  }

  async updateGameStats(userId: number, updates: Partial<GameStats>): Promise<void> {
    // Try to update existing stats
    const result = await db
      .update(gameStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameStats.userId, userId));

    // If no rows were affected, create new stats record
    if (!result.rowCount) {
      await db.insert(gameStats).values({
        userId,
        ...updates,
      });
    }
  }

  async getPlayerInventory(profileId: number): Promise<PlayerInventoryItem[]> {
    return await db
      .select()
      .from(playerInventory)
      .where(eq(playerInventory.playerProfileId, profileId));
  }

  async getGameStats(userId: number): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .where(eq(gameStats.userId, userId));
    return stats || undefined;
  }

  async getChatHistory(worldId: string, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.worldId, worldId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();