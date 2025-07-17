import { GameState, Player, Bullet, Gang, GameMap } from '../client/src/types/game';

export class GameStateManager {
  private gameState: GameState;
  private lastUpdateTime: number = Date.now();
  private tickRate: number = 60; // 60 FPS server tick rate
  
  constructor() {
    this.gameState = {
      players: {},
      bullets: {},
      gangs: {},
      currentMap: {
        id: 'default',
        name: 'Default Map',
        width: 2048,
        height: 2048,
        tiles: [],
        spawnPoints: [
          { x: 100, y: 100 },
          { x: 300, y: 300 },
          { x: 500, y: 500 },
          { x: 700, y: 700 }
        ]
      },
      gameTime: 0,
      isRunning: true
    };
  }
  
  public getGameState(): GameState {
    return this.gameState;
  }
  
  public setGameState(newState: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...newState };
  }
  
  public addPlayer(player: Player): void {
    this.gameState.players[player.id] = player;
    console.log(`[GameState] Player ${player.username} (${player.id}) added to game state`);
  }
  
  public removePlayer(playerId: string): void {
    const player = this.gameState.players[playerId];
    if (player) {
      delete this.gameState.players[playerId];
      console.log(`[GameState] Player ${player.username} (${playerId}) removed from game state`);
      
      // Remove player from any gang
      for (const gang of Object.values(this.gameState.gangs)) {
        const memberIndex = gang.members.indexOf(playerId);
        if (memberIndex !== -1) {
          gang.members.splice(memberIndex, 1);
          
          // If gang is empty, remove it
          if (gang.members.length === 0) {
            delete this.gameState.gangs[gang.id];
          } else if (gang.leader === playerId) {
            // Assign new leader
            gang.leader = gang.members[0];
          }
        }
      }
    }
  }
  
  public updatePlayer(playerId: string, updates: Partial<Player>): void {
    const player = this.gameState.players[playerId];
    if (player) {
      Object.assign(player, updates);
    }
  }
  
  public getPlayer(playerId: string): Player | undefined {
    return this.gameState.players[playerId];
  }
  
  public getPlayersInRange(position: { x: number; y: number }, range: number): Player[] {
    return Object.values(this.gameState.players).filter(player => {
      const distance = Math.sqrt(
        Math.pow(player.position.x - position.x, 2) + 
        Math.pow(player.position.y - position.y, 2)
      );
      return distance <= range;
    });
  }
  
  public addBullet(bullet: Bullet): void {
    this.gameState.bullets[bullet.id] = bullet;
  }
  
  public removeBullet(bulletId: string): void {
    delete this.gameState.bullets[bulletId];
  }
  
  public getBullet(bulletId: string): Bullet | undefined {
    return this.gameState.bullets[bulletId];
  }
  
  public getAllBullets(): Bullet[] {
    return Object.values(this.gameState.bullets);
  }
  
  public addGang(gang: Gang): void {
    this.gameState.gangs[gang.id] = gang;
    console.log(`[GameState] Gang ${gang.name} (${gang.id}) created`);
  }
  
  public removeGang(gangId: string): void {
    const gang = this.gameState.gangs[gangId];
    if (gang) {
      delete this.gameState.gangs[gangId];
      console.log(`[GameState] Gang ${gang.name} (${gangId}) removed`);
    }
  }
  
  public getGang(gangId: string): Gang | undefined {
    return this.gameState.gangs[gangId];
  }
  
  public updateGang(gangId: string, updates: Partial<Gang>): void {
    const gang = this.gameState.gangs[gangId];
    if (gang) {
      Object.assign(gang, updates);
    }
  }
  
  public setCurrentMap(map: GameMap): void {
    this.gameState.currentMap = map;
    console.log(`[GameState] Map changed to ${map.name}`);
  }
  
  public getCurrentMap(): GameMap {
    return this.gameState.currentMap;
  }
  
  public update(): void {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    
    this.gameState.gameTime += deltaTime;
    
    // Update bullets
    this.updateBullets(deltaTime);
    
    // Clean up expired bullets
    this.cleanupExpiredBullets();
    
    // Update player states
    this.updatePlayerStates(deltaTime);
  }
  
  private updateBullets(deltaTime: number): void {
    for (const bullet of Object.values(this.gameState.bullets)) {
      // Move bullet
      bullet.position.x += bullet.direction.x * bullet.speed * deltaTime;
      bullet.position.y += bullet.direction.y * bullet.direction.y * bullet.speed * deltaTime;
      
      // Decrease lifetime
      bullet.lifetime -= deltaTime * 1000;
    }
  }
  
  private cleanupExpiredBullets(): void {
    const bulletsToRemove: string[] = [];
    
    for (const [bulletId, bullet] of Object.entries(this.gameState.bullets)) {
      // Check if bullet is expired or out of bounds
      if (
        bullet.lifetime <= 0 ||
        bullet.position.x < -this.gameState.currentMap.width ||
        bullet.position.x > this.gameState.currentMap.width * 2 ||
        bullet.position.y < -this.gameState.currentMap.height ||
        bullet.position.y > this.gameState.currentMap.height * 2
      ) {
        bulletsToRemove.push(bulletId);
      }
    }
    
    bulletsToRemove.forEach(bulletId => {
      delete this.gameState.bullets[bulletId];
    });
  }
  
  private updatePlayerStates(deltaTime: number): void {
    for (const player of Object.values(this.gameState.players)) {
      // Auto-regen health slowly
      if (player.health < player.maxHealth && player.isAlive) {
        player.health = Math.min(player.maxHealth, player.health + 1 * deltaTime);
      }
      
      // Auto-regen ammo slowly
      if (player.ammo < 100) {
        player.ammo = Math.min(100, player.ammo + 5 * deltaTime);
      }
    }
  }
  
  public getStats(): {
    totalPlayers: number;
    alivePlayers: number;
    totalBullets: number;
    totalGangs: number;
    gameTime: number;
  } {
    const players = Object.values(this.gameState.players);
    return {
      totalPlayers: players.length,
      alivePlayers: players.filter(p => p.isAlive).length,
      totalBullets: Object.keys(this.gameState.bullets).length,
      totalGangs: Object.keys(this.gameState.gangs).length,
      gameTime: this.gameState.gameTime
    };
  }
  
  public reset(): void {
    this.gameState = {
      players: {},
      bullets: {},
      gangs: {},
      currentMap: this.gameState.currentMap,
      gameTime: 0,
      isRunning: true
    };
    console.log('[GameState] Game state reset');
  }
}
