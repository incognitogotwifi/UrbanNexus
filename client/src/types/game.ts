export interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  ammo: number;
  currency: number;
  kills: number;
  deaths: number;
  gangId: string | null;
  gangRank: string;
  weapon: string;
  isAlive: boolean;
  lastShot: number;
  color: string;
}

export interface Bullet {
  id: string;
  playerId: string;
  position: { x: number; y: number };
  direction: { x: number; y: number };
  damage: number;
  speed: number;
  lifetime: number;
  weapon: string;
}

export interface Gang {
  id: string;
  name: string;
  leader: string;
  members: string[];
  color: string;
  territory: { x: number; y: number; width: number; height: number };
  score: number;
}

export interface MapTile {
  id: string;
  type: 'floor' | 'wall' | 'object';
  texture: string;
  position: { x: number; y: number };
  collision: boolean;
  layer: number;
}

export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: MapTile[];
  spawnPoints: { x: number; y: number }[];
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  range: number;
  ammoType: string;
  sound: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'global' | 'gang' | 'system';
}

export interface GameState {
  players: Record<string, Player>;
  bullets: Record<string, Bullet>;
  gangs: Record<string, Gang>;
  currentMap: GameMap;
  gameTime: number;
  isRunning: boolean;
}

export type GameEvent = 
  | { type: 'PLAYER_JOIN'; payload: { player: Player } }
  | { type: 'PLAYER_LEAVE'; payload: { playerId: string } }
  | { type: 'PLAYER_MOVE'; payload: { playerId: string; position: { x: number; y: number } } }
  | { type: 'PLAYER_SHOOT'; payload: { playerId: string; bullet: Bullet } }
  | { type: 'PLAYER_HIT'; payload: { playerId: string; damage: number; shooterId: string } }
  | { type: 'PLAYER_DEATH'; payload: { playerId: string; killerId: string } }
  | { type: 'CHAT_MESSAGE'; payload: { message: ChatMessage } }
  | { type: 'GANG_CREATE'; payload: { gang: Gang } }
  | { type: 'GANG_JOIN'; payload: { playerId: string; gangId: string } }
  | { type: 'GAME_STATE_UPDATE'; payload: { gameState: Partial<GameState> } };
