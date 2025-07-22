const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { eq, desc } = require('drizzle-orm');
const { pgTable, serial, varchar, integer, timestamp, boolean, text } = require('drizzle-orm/pg-core');

// Define database schema in JavaScript
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true),
});

const playerProfiles = pgTable('player_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  characterName: varchar('character_name', { length: 50 }).notNull(),
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  hitPoints: integer('hit_points').default(100),
  maxHitPoints: integer('max_hit_points').default(100),
  armor: integer('armor').default(0),
  weapon: integer('weapon').default(0),
  x: integer('x').default(0),
  y: integer('y').default(0),
  orientation: integer('orientation').default(2),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  playerProfileId: integer('player_profile_id'),
  sessionStart: timestamp('session_start').defaultNow(),
  sessionEnd: timestamp('session_end'),
  playTimeSeconds: integer('play_time_seconds').default(0),
  mobsKilled: integer('mobs_killed').default(0),
  itemsCollected: integer('items_collected').default(0),
  experienceGained: integer('experience_gained').default(0),
});

const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  playerProfileId: integer('player_profile_id'),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  worldId: varchar('world_id', { length: 50 }),
});

const gameStats = pgTable('game_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  totalPlayTimeSeconds: integer('total_play_time_seconds').default(0),
  totalMobsKilled: integer('total_mobs_killed').default(0),
  totalItemsCollected: integer('total_items_collected').default(0),
  totalExperience: integer('total_experience').default(0),
  highestLevel: integer('highest_level').default(1),
  gamesPlayed: integer('games_played').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Initialize database connection
const schema = {
  users,
  playerProfiles,
  gameSessions,
  chatMessages,
  gameStats
};

let db;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

class DatabaseStorage {
  async getUserByUsername(username) {
    if (!db) return undefined;
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      return undefined;
    }
  }

  async createUser(userData) {
    if (!db) return null;
    try {
      const [user] = await db
        .insert(users)
        .values({
          username: userData.username,
          email: userData.email,
          createdAt: new Date(),
          isActive: true
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      return null;
    }
  }

  async createPlayerProfile(profileData) {
    if (!db) return null;
    try {
      const [profile] = await db
        .insert(playerProfiles)
        .values({
          userId: profileData.userId,
          characterName: profileData.characterName,
          level: profileData.level || 1,
          experience: profileData.experience || 0,
          hitPoints: profileData.hitPoints || 100,
          maxHitPoints: profileData.maxHitPoints || 100,
          armor: profileData.armor || 0,
          weapon: profileData.weapon || 0,
          x: profileData.x || 0,
          y: profileData.y || 0,
          orientation: profileData.orientation || 2,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return profile;
    } catch (error) {
      console.error('Database error in createPlayerProfile:', error);
      return null;
    }
  }

  async getPlayerProfile(userId) {
    if (!db) return null;
    try {
      const [profile] = await db
        .select()
        .from(playerProfiles)
        .where(eq(playerProfiles.userId, userId))
        .orderBy(desc(playerProfiles.createdAt));
      return profile;
    } catch (error) {
      console.error('Database error in getPlayerProfile:', error);
      return null;
    }
  }

  async updatePlayerProfile(profileId, updates) {
    if (!db) return;
    try {
      await db
        .update(playerProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(playerProfiles.id, profileId));
    } catch (error) {
      console.error('Database error in updatePlayerProfile:', error);
    }
  }

  async saveChatMessage(messageData) {
    if (!db) return null;
    try {
      const [message] = await db
        .insert(chatMessages)
        .values({
          userId: messageData.userId,
          playerProfileId: messageData.playerProfileId,
          message: messageData.message,
          worldId: messageData.worldId,
          timestamp: new Date()
        })
        .returning();
      return message;
    } catch (error) {
      console.error('Database error in saveChatMessage:', error);
      return null;
    }
  }

  async startGameSession(userId, playerProfileId) {
    if (!db) return null;
    try {
      const [session] = await db
        .insert(gameSessions)
        .values({
          userId: userId,
          playerProfileId: playerProfileId,
          sessionStart: new Date(),
          playTimeSeconds: 0,
          mobsKilled: 0,
          itemsCollected: 0,
          experienceGained: 0
        })
        .returning();
      return session;
    } catch (error) {
      console.error('Database error in startGameSession:', error);
      return null;
    }
  }

  async endGameSession(sessionId, stats) {
    if (!db) return;
    try {
      await db
        .update(gameSessions)
        .set({
          sessionEnd: new Date(),
          playTimeSeconds: stats.playTimeSeconds || 0,
          mobsKilled: stats.mobsKilled || 0,
          itemsCollected: stats.itemsCollected || 0,
          experienceGained: stats.experienceGained || 0
        })
        .where(eq(gameSessions.id, sessionId));
    } catch (error) {
      console.error('Database error in endGameSession:', error);
    }
  }
}

// Memory storage fallback for when database is not available
class MemoryStorage {
  constructor() {
    this.users = new Map();
    this.playerProfiles = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
  }

  async getUserByUsername(username) {
    for (const [id, user] of this.users) {
      if (user.username === username) {
        return { id, ...user };
      }
    }
    return undefined;
  }

  async createUser(userData) {
    const userId = this.currentUserId++;
    const user = {
      id: userId,
      username: userData.username,
      email: userData.email,
      createdAt: new Date(),
      isActive: true
    };
    this.users.set(userId, user);
    return user;
  }

  async createPlayerProfile(profileData) {
    const profileId = this.currentProfileId++;
    const profile = {
      id: profileId,
      userId: profileData.userId,
      characterName: profileData.characterName,
      level: profileData.level || 1,
      experience: profileData.experience || 0,
      hitPoints: profileData.hitPoints || 100,
      maxHitPoints: profileData.maxHitPoints || 100,
      armor: profileData.armor || 0,
      weapon: profileData.weapon || 0,
      x: profileData.x || 0,
      y: profileData.y || 0,
      orientation: profileData.orientation || 2,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.playerProfiles.set(profileId, profile);
    return profile;
  }

  async getPlayerProfile(userId) {
    for (const [id, profile] of this.playerProfiles) {
      if (profile.userId === userId) {
        return { id, ...profile };
      }
    }
    return null;
  }

  async updatePlayerProfile(profileId, updates) {
    const profile = this.playerProfiles.get(profileId);
    if (profile) {
      Object.assign(profile, updates);
      profile.updatedAt = new Date();
    }
  }

  async saveChatMessage(messageData) {
    // In memory storage, we don't persist chat messages
    return messageData;
  }

  async startGameSession(userId, playerProfileId) {
    return {
      id: Date.now(),
      userId,
      playerProfileId,
      sessionStart: new Date()
    };
  }

  async endGameSession(sessionId, stats) {
    // In memory storage, we don't persist sessions
  }
}

// Export the appropriate storage implementation
const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemoryStorage();

module.exports = { storage };