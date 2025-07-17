export const TILE_SIZE = 32;
export const PLAYER_SPEED = 200;
export const BULLET_SPEED = 500;

export function normalizeVector(vector: { x: number; y: number }) {
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (magnitude === 0) return { x: 0, y: 0 };
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function checkAABBCollision(
  pos1: { x: number; y: number },
  size1: { width: number; height: number },
  pos2: { x: number; y: number },
  size2: { width: number; height: number }
) {
  return (
    pos1.x < pos2.x + size2.width &&
    pos1.x + size1.width > pos2.x &&
    pos1.y < pos2.y + size2.height &&
    pos1.y + size1.height > pos2.y
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}

export function isValidPosition(x: number, y: number, mapWidth: number, mapHeight: number) {
  return x >= 0 && x < mapWidth && y >= 0 && y < mapHeight;
}

export function worldToTile(worldPos: { x: number; y: number }) {
  return {
    x: Math.floor(worldPos.x / TILE_SIZE),
    y: Math.floor(worldPos.y / TILE_SIZE)
  };
}

export function tileToWorld(tilePos: { x: number; y: number }) {
  return {
    x: tilePos.x * TILE_SIZE,
    y: tilePos.y * TILE_SIZE
  };
}
