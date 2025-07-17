import { Player, GameEvent } from '../client/src/types/game';
import { GameStateManager } from './gameState';

export class PlayerManager {
  private gameState: GameStateManager;
  private playerSpawnQueue: string[] = [];
  private respawnTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }
  
  public createPlayer(playerData: Partial<Player>): Player {
    const playerId = this.generatePlayerId();
    
    const player: Player = {
      id: playerId,
      username: playerData.username || `Player${playerId}`,
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      ammo: 100,
      currency: 0,
      kills: 0,
      deaths: 0,
      gangId: null,
      gangRank: 'member',
      weapon: 'pistol',
      isAlive: true,
      lastShot: 0,
      color: playerData.color || this.generatePlayerColor(),
      ...playerData
    };
    
    // Set spawn position
    player.position = this.getSpawnPosition();
    
    this.gameState.addPlayer(player);
    
    console.log(`[PlayerManager] Created player ${player.username} (${playerId})`);
    
    return player;
  }
  
  public removePlayer(playerId: string): void {
    const player = this.gameState.getPlayer(playerId);
    if (player) {
      // Clear any respawn timer
      const respawnTimer = this.respawnTimers.get(playerId);
      if (respawnTimer) {
        clearTimeout(respawnTimer);
        this.respawnTimers.delete(playerId);
      }
      
      this.gameState.removePlayer(playerId);
      console.log(`[PlayerManager] Removed player ${player.username} (${playerId})`);
    }
  }
  
  public updatePlayerPosition(playerId: string, position: { x: number; y: number }): boolean {
    const player = this.gameState.getPlayer(playerId);
    if (!player || !player.isAlive) {
      return false;
    }
    
    // Validate movement (basic anti-cheat)
    const maxSpeed = 300; // pixels per second
    const distance = Math.sqrt(
      Math.pow(position.x - player.position.x, 2) + 
      Math.pow(position.y - player.position.y, 2)
    );
    
    // Allow movement up to maxSpeed pixels per update (assuming 60fps)
    if (distance > maxSpeed / 60) {
      console.log(`[PlayerManager] Player ${playerId} attempted invalid movement: ${distance} pixels`);
      return false;
    }
    
    // Check map boundaries
    const currentMap = this.gameState.getCurrentMap();
    if (position.x < 0 || position.x > currentMap.width || 
        position.y < 0 || position.y > currentMap.height) {
      return false;
    }
    
    player.position = position;
    return true;
  }
  
  public handlePlayerShoot(playerId: string, direction: { x: number; y: number }): boolean {
    const player = this.gameState.getPlayer(playerId);
    if (!player || !player.isAlive || player.ammo <= 0) {
      return false;
    }
    
    // Check fire rate
    const currentTime = Date.now();
    const fireRate = this.getWeaponFireRate(player.weapon);
    if (currentTime - player.lastShot < fireRate) {
      return false;
    }
    
    // Normalize direction
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (magnitude === 0) return false;
    
    const normalizedDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude
    };
    
    // Update player state
    player.lastShot = currentTime;
    player.ammo = Math.max(0, player.ammo - 1);
    
    // Create bullet
    const bullet = {
      id: this.generateBulletId(),
      playerId: playerId,
      position: { ...player.position },
      direction: normalizedDirection,
      damage: this.getWeaponDamage(player.weapon),
      speed: 500,
      lifetime: 2000,
      weapon: player.weapon
    };
    
    this.gameState.addBullet(bullet);
    
    console.log(`[PlayerManager] Player ${playerId} shot bullet ${bullet.id}`);
    
    return true;
  }
  
  public damagePlayer(playerId: string, damage: number, shooterId?: string): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player || !player.isAlive) return;
    
    const oldHealth = player.health;
    player.health = Math.max(0, player.health - damage);
    
    console.log(`[PlayerManager] Player ${playerId} took ${damage} damage (${oldHealth} -> ${player.health})`);
    
    if (player.health <= 0) {
      this.killPlayer(playerId, shooterId);
    }
  }
  
  public killPlayer(playerId: string, killerId?: string): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return;
    
    player.isAlive = false;
    player.health = 0;
    player.deaths++;
    
    // Update killer stats
    if (killerId) {
      const killer = this.gameState.getPlayer(killerId);
      if (killer) {
        killer.kills++;
        killer.currency += 50; // Reward for kill
      }
    }
    
    console.log(`[PlayerManager] Player ${playerId} was killed by ${killerId || 'unknown'}`);
    
    // Schedule respawn
    this.scheduleRespawn(playerId);
  }
  
  public healPlayer(playerId: string, amount: number): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return;
    
    const oldHealth = player.health;
    player.health = Math.min(player.maxHealth, player.health + amount);
    
    console.log(`[PlayerManager] Player ${playerId} healed ${amount} HP (${oldHealth} -> ${player.health})`);
  }
  
  public giveAmmo(playerId: string, amount: number): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return;
    
    const oldAmmo = player.ammo;
    player.ammo = Math.min(100, player.ammo + amount);
    
    console.log(`[PlayerManager] Player ${playerId} received ${amount} ammo (${oldAmmo} -> ${player.ammo})`);
  }
  
  public changeWeapon(playerId: string, weaponId: string): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return;
    
    player.weapon = weaponId;
    console.log(`[PlayerManager] Player ${playerId} changed weapon to ${weaponId}`);
  }
  
  private scheduleRespawn(playerId: string): void {
    const respawnDelay = 5000; // 5 seconds
    
    // Clear existing timer if any
    const existingTimer = this.respawnTimers.get(playerId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(() => {
      this.respawnPlayer(playerId);
      this.respawnTimers.delete(playerId);
    }, respawnDelay);
    
    this.respawnTimers.set(playerId, timer);
    console.log(`[PlayerManager] Player ${playerId} will respawn in ${respawnDelay}ms`);
  }
  
  private respawnPlayer(playerId: string): void {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return;
    
    player.isAlive = true;
    player.health = player.maxHealth;
    player.ammo = 100;
    player.position = this.getSpawnPosition();
    
    console.log(`[PlayerManager] Player ${playerId} respawned at (${player.position.x}, ${player.position.y})`);
  }
  
  private getSpawnPosition(): { x: number; y: number } {
    const currentMap = this.gameState.getCurrentMap();
    const spawnPoints = currentMap.spawnPoints;
    
    if (spawnPoints.length === 0) {
      return { x: 100, y: 100 };
    }
    
    // Find a spawn point that's not too crowded
    let bestSpawn = spawnPoints[0];
    let minPlayersNearby = Infinity;
    
    for (const spawnPoint of spawnPoints) {
      const playersNearby = this.gameState.getPlayersInRange(spawnPoint, 100);
      if (playersNearby.length < minPlayersNearby) {
        minPlayersNearby = playersNearby.length;
        bestSpawn = spawnPoint;
      }
    }
    
    return { ...bestSpawn };
  }
  
  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateBulletId(): string {
    return `bullet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generatePlayerColor(): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
      '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#e17055', '#81ecec'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  private getWeaponFireRate(weaponId: string): number {
    const fireRates: Record<string, number> = {
      'pistol': 300,
      'rifle': 150,
      'shotgun': 800,
      'smg': 100
    };
    
    return fireRates[weaponId] || 300;
  }
  
  private getWeaponDamage(weaponId: string): number {
    const damages: Record<string, number> = {
      'pistol': 25,
      'rifle': 40,
      'shotgun': 60,
      'smg': 20
    };
    
    return damages[weaponId] || 25;
  }
  
  public getPlayerStats(playerId: string): {
    kills: number;
    deaths: number;
    kdr: number;
    accuracy: number;
  } | null {
    const player = this.gameState.getPlayer(playerId);
    if (!player) return null;
    
    return {
      kills: player.kills,
      deaths: player.deaths,
      kdr: player.deaths > 0 ? player.kills / player.deaths : player.kills,
      accuracy: 0 // TODO: Implement shot tracking
    };
  }
  
  public getLeaderboard(): Array<{
    playerId: string;
    username: string;
    kills: number;
    deaths: number;
    kdr: number;
  }> {
    const players = Object.values(this.gameState.getGameState().players);
    
    return players
      .map(player => ({
        playerId: player.id,
        username: player.username,
        kills: player.kills,
        deaths: player.deaths,
        kdr: player.deaths > 0 ? player.kills / player.deaths : player.kills
      }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);
  }
}
