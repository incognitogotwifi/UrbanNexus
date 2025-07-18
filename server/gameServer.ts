import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { GameState, Player, Bullet, Gang, GameEvent } from '../client/src/types/game';
import { PlayerManager } from './playerManager';
import { GangManager } from './gangManager';
import { WeaponManager } from './weaponManager';
import { MapManager } from './mapManager';
import { GameStateManager } from './gameState';
import { generateId, normalizeVector, distance, checkAABBCollision } from '../client/src/lib/gameUtils';

export class GameServer {
  private wss: WebSocketServer;
  private gameState: GameStateManager;
  private playerManager: PlayerManager;
  private gangManager: GangManager;
  private weaponManager: WeaponManager;
  private mapManager: MapManager;
  private gameLoop: NodeJS.Timeout;
  private clients: Map<string, WebSocket> = new Map();
  private httpServer: Server;
  private serverLogs: string[] = [];
  
  constructor(httpServer: Server) {
    this.httpServer = httpServer;
    this.wss = new WebSocketServer({ 
      server: httpServer,
      path: '/game-ws'
    });
    this.playerManager = new PlayerManager();
    this.gangManager = new GangManager();
    this.weaponManager = new WeaponManager();
    this.mapManager = new MapManager();
    
    this.gameState = {
      players: {},
      bullets: {},
      gangs: {},
      currentMap: this.mapManager.getDefaultMap(),
      gameTime: 0,
      isRunning: true
    };
    
    this.setupWebSocketServer();
    this.startGameLoop();
    
    console.log(`Game server started with WebSocket support`);
  }
  
  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');
      
      ws.on('message', (message: string) => {
        try {
          const event: GameEvent = JSON.parse(message);
          this.handleGameEvent(ws, event);
        } catch (error) {
          console.error('Error parsing game event:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('Client disconnected');
        this.handlePlayerDisconnect(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }
  
  private handleGameEvent(ws: WebSocket, event: GameEvent) {
    switch (event.type) {
      case 'PLAYER_JOIN':
        this.handlePlayerJoin(ws, event.payload.player);
        break;
        
      case 'PLAYER_MOVE':
        this.handlePlayerMove(event.payload.playerId, event.payload.position);
        break;
        
      case 'PLAYER_SHOOT':
        this.handlePlayerShoot(event.payload.playerId, event.payload.bullet);
        break;
        
      case 'CHAT_MESSAGE':
        this.handleChatMessage(event.payload.message);
        break;
        
      case 'GANG_CREATE':
        this.handleGangCreate(event.payload.gang);
        break;
        
      case 'GANG_JOIN':
        this.handleGangJoin(event.payload.playerId, event.payload.gangId);
        break;
        
      default:
        console.log('Unknown event type:', event.type);
    }
  }
  
  private handlePlayerJoin(ws: WebSocket, playerData: Player) {
    const playerId = generateId();
    const spawnPoint = this.mapManager.getSpawnPoint();
    
    const player: Player = {
      ...playerData,
      id: playerId,
      position: spawnPoint,
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
      color: playerData.color || `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    
    this.gameState.players[playerId] = player;
    this.clients.set(playerId, ws);
    
    // Send current game state to new player
    this.sendToPlayer(playerId, {
      type: 'GAME_STATE_UPDATE',
      payload: { gameState: this.gameState }
    });
    
    // Broadcast player join to all players
    this.broadcast({
      type: 'PLAYER_JOIN',
      payload: { player }
    });
    
    console.log(`Player ${player.username} joined with ID ${playerId}`);
  }
  
  private handlePlayerMove(playerId: string, position: { x: number; y: number }) {
    const player = this.gameState.players[playerId];
    if (!player || !player.isAlive) return;
    
    // Basic anti-cheat: validate movement distance
    const maxMoveDistance = 10; // Max pixels per move
    const moveDistance = distance(player.position, position);
    
    if (moveDistance > maxMoveDistance) {
      console.log(`Player ${playerId} attempted invalid move: ${moveDistance} pixels`);
      return;
    }
    
    // Check collision with map
    if (this.mapManager.checkCollision(position.x, position.y)) {
      return;
    }
    
    player.position = position;
    
    // Broadcast movement to all players
    this.broadcast({
      type: 'PLAYER_MOVE',
      payload: { playerId, position }
    });
  }
  
  private handlePlayerShoot(playerId: string, bullet: Bullet) {
    const player = this.gameState.players[playerId];
    if (!player || !player.isAlive || player.ammo <= 0) return;
    
    // Check fire rate
    const weapon = this.weaponManager.getWeapon(player.weapon);
    const currentTime = Date.now();
    if (currentTime - player.lastShot < weapon.fireRate) {
      return;
    }
    
    // Update player state
    player.ammo = Math.max(0, player.ammo - 1);
    player.lastShot = currentTime;
    
    // Add bullet to game state
    bullet.id = generateId();
    bullet.playerId = playerId;
    bullet.damage = weapon.damage;
    this.gameState.bullets[bullet.id] = bullet;
    
    // Broadcast bullet to all players
    this.broadcast({
      type: 'PLAYER_SHOOT',
      payload: { playerId, bullet }
    });
    
    console.log(`Player ${playerId} shot bullet ${bullet.id}`);
  }
  
  private handleChatMessage(message: any) {
    // Broadcast chat message to all players
    this.broadcast({
      type: 'CHAT_MESSAGE',
      payload: { message }
    });
  }
  
  private handleGangCreate(gang: Gang) {
    gang.id = generateId();
    this.gameState.gangs[gang.id] = gang;
    
    // Update player's gang
    const player = this.gameState.players[gang.leader];
    if (player) {
      player.gangId = gang.id;
      player.gangRank = 'leader';
    }
    
    this.broadcast({
      type: 'GANG_CREATE',
      payload: { gang }
    });
  }
  
  private handleGangJoin(playerId: string, gangId: string) {
    const player = this.gameState.players[playerId];
    const gang = this.gameState.gangs[gangId];
    
    if (!player || !gang || gang.members.length >= 4) return;
    
    player.gangId = gangId;
    gang.members.push(playerId);
    
    this.broadcast({
      type: 'GANG_JOIN',
      payload: { playerId, gangId }
    });
  }
  
  private handlePlayerDisconnect(ws: WebSocket) {
    // Find player by websocket
    let playerId: string | null = null;
    for (const [id, client] of this.clients.entries()) {
      if (client === ws) {
        playerId = id;
        break;
      }
    }
    
    if (playerId) {
      delete this.gameState.players[playerId];
      this.clients.delete(playerId);
      
      // Broadcast player leave
      this.broadcast({
        type: 'PLAYER_LEAVE',
        payload: { playerId }
      });
      
      console.log(`Player ${playerId} disconnected`);
    }
  }
  
  private startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, 1000 / 60); // 60 FPS
  }
  
  private updateGame() {
    this.gameState.gameTime += 1000 / 60;
    
    // Update bullets
    this.updateBullets();
    
    // Check collisions
    this.checkCollisions();
    
    // Send game state updates to all players
    this.broadcastGameState();
  }
  
  private updateBullets() {
    const bulletsToRemove: string[] = [];
    
    for (const [bulletId, bullet] of Object.entries(this.gameState.bullets)) {
      // Move bullet
      const movement = bullet.speed * (1 / 60);
      bullet.position.x += bullet.direction.x * movement;
      bullet.position.y += bullet.direction.y * movement;
      
      // Check if bullet is out of bounds or expired
      if (
        bullet.position.x < -1000 || bullet.position.x > 1000 ||
        bullet.position.y < -1000 || bullet.position.y > 1000 ||
        Date.now() - bullet.lifetime > 2000
      ) {
        bulletsToRemove.push(bulletId);
      }
      
      // Check collision with map
      if (this.mapManager.checkCollision(bullet.position.x, bullet.position.y)) {
        bulletsToRemove.push(bulletId);
      }
    }
    
    // Remove expired bullets
    bulletsToRemove.forEach(bulletId => {
      delete this.gameState.bullets[bulletId];
    });
  }
  
  private checkCollisions() {
    // Check bullet-player collisions
    for (const [bulletId, bullet] of Object.entries(this.gameState.bullets)) {
      for (const [playerId, player] of Object.entries(this.gameState.players)) {
        if (
          player.id !== bullet.playerId &&
          player.isAlive &&
          distance(bullet.position, player.position) < 20
        ) {
          // Hit!
          player.health = Math.max(0, player.health - bullet.damage);
          
          if (player.health <= 0) {
            player.isAlive = false;
            
            // Update kill stats
            const shooter = this.gameState.players[bullet.playerId];
            if (shooter) {
              shooter.kills++;
            }
            player.deaths++;
            
            // Broadcast death
            this.broadcast({
              type: 'PLAYER_DEATH',
              payload: { playerId: player.id, killerId: bullet.playerId }
            });
            
            // Respawn player after 5 seconds
            setTimeout(() => {
              if (this.gameState.players[playerId]) {
                player.health = player.maxHealth;
                player.isAlive = true;
                player.position = this.mapManager.getSpawnPoint();
                player.ammo = 100;
              }
            }, 5000);
          }
          
          // Remove bullet
          delete this.gameState.bullets[bulletId];
          
          // Broadcast hit
          this.broadcast({
            type: 'PLAYER_HIT',
            payload: { playerId: player.id, damage: bullet.damage, shooterId: bullet.playerId }
          });
          
          break;
        }
      }
    }
  }
  
  private broadcastGameState() {
    // Send updates every 10 frames (6 times per second)
    if (Math.floor(this.gameState.gameTime) % 10 === 0) {
      this.broadcast({
        type: 'GAME_STATE_UPDATE',
        payload: { gameState: this.gameState }
      });
    }
  }
  
  private broadcast(event: GameEvent) {
    const message = JSON.stringify(event);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  private sendToPlayer(playerId: string, event: GameEvent) {
    const client = this.clients.get(playerId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }
  
  // API methods required by routes
  public getStats() {
    return {
      totalPlayers: Object.keys(this.gameState.players).length,
      activePlayers: Object.values(this.gameState.players).filter(p => p.isAlive).length,
      totalBullets: Object.keys(this.gameState.bullets).length,
      totalGangs: Object.keys(this.gameState.gangs).length,
      uptime: process.uptime(),
      gameTime: this.gameState.gameTime
    };
  }

  public getPlayers() {
    return Object.values(this.gameState.players).map(player => ({
      id: player.id,
      username: player.username,
      health: player.health,
      isAlive: player.isAlive,
      kills: player.kills,
      deaths: player.deaths,
      gangId: player.gangId,
      position: player.position,
      role: player.role
    }));
  }

  public getGangs() {
    return Object.values(this.gameState.gangs).map(gang => ({
      id: gang.id,
      name: gang.name,
      leader: gang.leader,
      members: gang.members.length,
      kills: gang.kills,
      deaths: gang.deaths,
      createdAt: gang.createdAt
    }));
  }

  public getLeaderboard() {
    const players = Object.values(this.gameState.players);
    return players
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10)
      .map((player, index) => ({
        rank: index + 1,
        username: player.username,
        kills: player.kills,
        deaths: player.deaths,
        kdr: player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toString(),
        gang: player.gangId ? this.gameState.gangs[player.gangId]?.name : 'None'
      }));
  }

  public getCurrentMap() {
    return this.gameState.currentMap;
  }

  public getWeapons() {
    return this.weaponManager.getAllWeapons();
  }

  public kickPlayer(playerId: string, reason: string) {
    const player = this.gameState.players[playerId];
    if (!player) return { success: false, message: 'Player not found' };

    const client = this.clients.get(playerId);
    if (client) {
      client.send(JSON.stringify({
        type: 'PLAYER_KICKED',
        payload: { reason }
      }));
      client.close();
    }

    delete this.gameState.players[playerId];
    this.clients.delete(playerId);
    
    this.serverLogs.push(`Player ${player.username} (${playerId}) was kicked: ${reason}`);
    
    this.broadcast({
      type: 'PLAYER_KICKED',
      payload: { playerId, username: player.username, reason }
    });

    return { success: true, message: `Player ${player.username} kicked` };
  }

  public banPlayer(playerId: string, reason: string) {
    const player = this.gameState.players[playerId];
    if (!player) return { success: false, message: 'Player not found' };

    // In a real implementation, you'd save the ban to a database
    this.serverLogs.push(`Player ${player.username} (${playerId}) was banned: ${reason}`);
    
    return this.kickPlayer(playerId, `Banned: ${reason}`);
  }

  public healPlayer(playerId: string, amount: number) {
    const player = this.gameState.players[playerId];
    if (!player) return { success: false, message: 'Player not found' };

    player.health = Math.min(player.maxHealth, player.health + amount);
    
    this.broadcast({
      type: 'PLAYER_HEALED',
      payload: { playerId, health: player.health }
    });

    return { success: true, message: `Player ${player.username} healed for ${amount} HP` };
  }

  public teleportPlayer(playerId: string, x: number, y: number) {
    const player = this.gameState.players[playerId];
    if (!player) return { success: false, message: 'Player not found' };

    player.position.x = x;
    player.position.y = y;
    
    this.broadcast({
      type: 'PLAYER_TELEPORTED',
      payload: { playerId, position: player.position }
    });

    return { success: true, message: `Player ${player.username} teleported to (${x}, ${y})` };
  }

  public getLogs() {
    return this.serverLogs.slice(-100); // Return last 100 logs
  }

  public saveMap(mapData: any) {
    try {
      // Update the map in the map manager
      const success = this.mapManager.updateMap(mapData.id || 'default', mapData);
      
      if (success) {
        this.serverLogs.push(`Map saved: ${mapData.name}`);
        
        // Broadcast map update to all connected clients
        this.broadcast({
          type: 'MAP_UPDATED',
          payload: { map: mapData }
        });
        
        return { success: true, message: 'Map saved successfully' };
      } else {
        return { success: false, message: 'Failed to save map' };
      }
    } catch (error) {
      console.error('Error saving map:', error);
      return { success: false, message: 'Error saving map' };
    }
  }

  public getMap(mapId: string) {
    return this.mapManager.getMap(mapId);
  }

  public getAllMaps() {
    return this.mapManager.getAllMaps();
  }

  public createGang(gangData: any) {
    const gang = this.gangManager.createGang(gangData);
    this.gameState.gangs[gang.id] = gang;
    
    this.broadcast({
      type: 'GANG_CREATED',
      payload: { gang }
    });

    return { success: true, gang };
  }

  public joinGang(playerId: string, gangId: string) {
    const player = this.gameState.players[playerId];
    const gang = this.gameState.gangs[gangId];
    
    if (!player) return { success: false, message: 'Player not found' };
    if (!gang) return { success: false, message: 'Gang not found' };

    player.gangId = gangId;
    if (!gang.members.includes(playerId)) {
      gang.members.push(playerId);
    }

    this.broadcast({
      type: 'PLAYER_JOINED_GANG',
      payload: { playerId, gangId }
    });

    return { success: true, message: `Player joined ${gang.name}` };
  }

  public leaveGang(playerId: string) {
    const player = this.gameState.players[playerId];
    if (!player || !player.gangId) return { success: false, message: 'Player not in a gang' };

    const gang = this.gameState.gangs[player.gangId];
    if (gang) {
      gang.members = gang.members.filter(id => id !== playerId);
      if (gang.members.length === 0) {
        delete this.gameState.gangs[player.gangId];
      }
    }

    player.gangId = null;

    this.broadcast({
      type: 'PLAYER_LEFT_GANG',
      payload: { playerId }
    });

    return { success: true, message: 'Player left gang' };
  }

  public restart() {
    // Reset game state
    this.gameState = {
      players: {},
      bullets: {},
      gangs: {},
      currentMap: this.mapManager.getDefaultMap(),
      gameTime: 0,
      isRunning: true
    };

    // Disconnect all clients
    this.clients.forEach(client => {
      client.send(JSON.stringify({
        type: 'SERVER_RESTART',
        payload: { message: 'Server is restarting' }
      }));
      client.close();
    });
    this.clients.clear();

    this.serverLogs.push('Server restarted');
    return { success: true, message: 'Server restarted' };
  }

  public getServerStatus() {
    return {
      isRunning: this.gameState.isRunning,
      players: Object.keys(this.gameState.players).length,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      gameTime: this.gameState.gameTime
    };
  }

  public updateSettings(settings: any) {
    // In a real implementation, you'd update server settings
    this.serverLogs.push(`Settings updated: ${JSON.stringify(settings)}`);
    return { success: true, message: 'Settings updated' };
  }

  public stop() {
    clearInterval(this.gameLoop);
    this.wss.close();
    console.log('Game server stopped');
  }
}
