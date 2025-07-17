import { GameMap, MapTile } from '../client/src/types/game';

export class MapManager {
  private maps: Map<string, GameMap> = new Map();
  private currentMapId: string = 'default';
  
  constructor() {
    this.initializeDefaultMaps();
  }
  
  private initializeDefaultMaps(): void {
    const defaultMap: GameMap = {
      id: 'default',
      name: 'Urban Streets',
      width: 2048,
      height: 2048,
      tiles: this.generateDefaultTiles(),
      spawnPoints: [
        { x: 200, y: 200 },
        { x: 400, y: 400 },
        { x: 600, y: 600 },
        { x: 800, y: 800 },
        { x: 1000, y: 1000 },
        { x: 1200, y: 1200 },
        { x: 1400, y: 1400 },
        { x: 1600, y: 1600 }
      ]
    };
    
    this.maps.set('default', defaultMap);
    
    console.log(`[MapManager] Initialized default map: ${defaultMap.name}`);
  }
  
  private generateDefaultTiles(): MapTile[] {
    const tiles: MapTile[] = [];
    const tileSize = 32;
    const mapWidth = 2048;
    const mapHeight = 2048;
    const tilesX = Math.floor(mapWidth / tileSize);
    const tilesY = Math.floor(mapHeight / tileSize);
    
    // Generate floor tiles
    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        let texture = '/textures/asphalt.png';
        let collision = false;
        
        // Add some variation
        if (Math.random() < 0.3) {
          texture = '/textures/grass.png';
        }
        
        // Add some walls randomly
        if (Math.random() < 0.1) {
          collision = true;
        }
        
        tiles.push({
          id: `tile_${x}_${y}`,
          type: collision ? 'wall' : 'floor',
          texture,
          position: { x, y },
          collision,
          layer: 0
        });
      }
    }
    
    // Add some buildings/structures
    this.addBuildings(tiles, tilesX, tilesY);
    
    return tiles;
  }
  
  private addBuildings(tiles: MapTile[], tilesX: number, tilesY: number): void {
    // Add a few buildings
    const buildings = [
      { x: 10, y: 10, width: 8, height: 6 },
      { x: 30, y: 15, width: 6, height: 8 },
      { x: 50, y: 20, width: 10, height: 4 },
      { x: 20, y: 40, width: 5, height: 5 },
      { x: 45, y: 45, width: 7, height: 7 }
    ];
    
    buildings.forEach(building => {
      for (let bx = building.x; bx < building.x + building.width && bx < tilesX; bx++) {
        for (let by = building.y; by < building.y + building.height && by < tilesY; by++) {
          const tileIndex = tiles.findIndex(tile => tile.position.x === bx && tile.position.y === by);
          if (tileIndex !== -1) {
            tiles[tileIndex] = {
              id: `building_${bx}_${by}`,
              type: 'wall',
              texture: '/textures/wood.jpg',
              position: { x: bx, y: by },
              collision: true,
              layer: 1
            };
          }
        }
      }
    });
  }
  
  public getCurrentMap(): GameMap {
    const map = this.maps.get(this.currentMapId);
    if (!map) {
      console.log(`[MapManager] Warning: current map ${this.currentMapId} not found, using default`);
      return this.maps.get('default')!;
    }
    return map;
  }
  
  public getMap(mapId: string): GameMap | null {
    return this.maps.get(mapId) || null;
  }
  
  public getAllMaps(): GameMap[] {
    return Array.from(this.maps.values());
  }
  
  public setCurrentMap(mapId: string): boolean {
    if (!this.maps.has(mapId)) {
      console.log(`[MapManager] Cannot set current map: ${mapId} not found`);
      return false;
    }
    
    this.currentMapId = mapId;
    console.log(`[MapManager] Current map changed to ${mapId}`);
    return true;
  }
  
  public addMap(map: GameMap): void {
    this.maps.set(map.id, map);
    console.log(`[MapManager] Added map ${map.name} (${map.id})`);
  }
  
  public removeMap(mapId: string): boolean {
    if (mapId === 'default') {
      console.log(`[MapManager] Cannot remove default map`);
      return false;
    }
    
    const success = this.maps.delete(mapId);
    if (success) {
      console.log(`[MapManager] Removed map ${mapId}`);
      
      // If current map was removed, switch to default
      if (this.currentMapId === mapId) {
        this.currentMapId = 'default';
      }
    }
    
    return success;
  }
  
  public updateMap(mapId: string, updates: Partial<GameMap>): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot update map: ${mapId} not found`);
      return false;
    }
    
    Object.assign(map, updates);
    console.log(`[MapManager] Updated map ${mapId}`);
    return true;
  }
  
  public addTile(mapId: string, tile: MapTile): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot add tile: map ${mapId} not found`);
      return false;
    }
    
    // Check if tile already exists at position
    const existingTileIndex = map.tiles.findIndex(
      t => t.position.x === tile.position.x && t.position.y === tile.position.y && t.layer === tile.layer
    );
    
    if (existingTileIndex !== -1) {
      // Replace existing tile
      map.tiles[existingTileIndex] = tile;
    } else {
      // Add new tile
      map.tiles.push(tile);
    }
    
    return true;
  }
  
  public removeTile(mapId: string, tileId: string): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot remove tile: map ${mapId} not found`);
      return false;
    }
    
    const tileIndex = map.tiles.findIndex(tile => tile.id === tileId);
    if (tileIndex === -1) {
      console.log(`[MapManager] Cannot remove tile: tile ${tileId} not found`);
      return false;
    }
    
    map.tiles.splice(tileIndex, 1);
    return true;
  }
  
  public checkCollision(x: number, y: number, mapId?: string): boolean {
    const map = mapId ? this.maps.get(mapId) : this.getCurrentMap();
    if (!map) return false;
    
    const tileSize = 32;
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    
    // Check if position is within map bounds
    if (tileX < 0 || tileX >= Math.floor(map.width / tileSize) || 
        tileY < 0 || tileY >= Math.floor(map.height / tileSize)) {
      return true; // Out of bounds = collision
    }
    
    // Check for collision tiles
    return map.tiles.some(tile => 
      tile.collision && 
      tile.position.x === tileX && 
      tile.position.y === tileY
    );
  }
  
  public getSpawnPoint(mapId?: string): { x: number; y: number } {
    const map = mapId ? this.maps.get(mapId) : this.getCurrentMap();
    if (!map || map.spawnPoints.length === 0) {
      return { x: 100, y: 100 };
    }
    
    // Find a spawn point that's not colliding with anything
    const availableSpawns = map.spawnPoints.filter(spawn => 
      !this.checkCollision(spawn.x, spawn.y, mapId)
    );
    
    if (availableSpawns.length === 0) {
      // If no spawn points are available, use the first one anyway
      return { ...map.spawnPoints[0] };
    }
    
    // Return random available spawn point
    const randomIndex = Math.floor(Math.random() * availableSpawns.length);
    return { ...availableSpawns[randomIndex] };
  }
  
  public addSpawnPoint(mapId: string, position: { x: number; y: number }): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot add spawn point: map ${mapId} not found`);
      return false;
    }
    
    // Check if spawn point already exists at position
    const existingSpawn = map.spawnPoints.find(
      spawn => spawn.x === position.x && spawn.y === position.y
    );
    
    if (existingSpawn) {
      console.log(`[MapManager] Spawn point already exists at (${position.x}, ${position.y})`);
      return false;
    }
    
    map.spawnPoints.push(position);
    console.log(`[MapManager] Added spawn point at (${position.x}, ${position.y}) to map ${mapId}`);
    return true;
  }
  
  public removeSpawnPoint(mapId: string, position: { x: number; y: number }): boolean {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot remove spawn point: map ${mapId} not found`);
      return false;
    }
    
    const spawnIndex = map.spawnPoints.findIndex(
      spawn => spawn.x === position.x && spawn.y === position.y
    );
    
    if (spawnIndex === -1) {
      console.log(`[MapManager] Cannot remove spawn point: not found at (${position.x}, ${position.y})`);
      return false;
    }
    
    map.spawnPoints.splice(spawnIndex, 1);
    console.log(`[MapManager] Removed spawn point at (${position.x}, ${position.y}) from map ${mapId}`);
    return true;
  }
  
  public getDefaultMap(): GameMap {
    return this.maps.get('default')!;
  }
  
  public exportMap(mapId: string): string | null {
    const map = this.maps.get(mapId);
    if (!map) {
      console.log(`[MapManager] Cannot export map: ${mapId} not found`);
      return null;
    }
    
    return JSON.stringify(map, null, 2);
  }
  
  public importMap(mapData: string): boolean {
    try {
      const map: GameMap = JSON.parse(mapData);
      
      // Validate map data
      if (!map.id || !map.name || typeof map.width !== 'number' || 
          typeof map.height !== 'number' || !Array.isArray(map.tiles) || 
          !Array.isArray(map.spawnPoints)) {
        console.log(`[MapManager] Invalid map data structure`);
        return false;
      }
      
      this.maps.set(map.id, map);
      console.log(`[MapManager] Imported map ${map.name} (${map.id})`);
      return true;
      
    } catch (error) {
      console.log(`[MapManager] Error importing map: ${error}`);
      return false;
    }
  }
  
  public getMapStats(mapId: string): {
    totalTiles: number;
    collisionTiles: number;
    spawnPoints: number;
    layers: number;
    coverage: number;
  } | null {
    const map = this.maps.get(mapId);
    if (!map) return null;
    
    const collisionTiles = map.tiles.filter(tile => tile.collision).length;
    const layers = Math.max(...map.tiles.map(tile => tile.layer)) + 1;
    const tileSize = 32;
    const maxTiles = Math.floor(map.width / tileSize) * Math.floor(map.height / tileSize);
    const coverage = (map.tiles.length / maxTiles) * 100;
    
    return {
      totalTiles: map.tiles.length,
      collisionTiles,
      spawnPoints: map.spawnPoints.length,
      layers,
      coverage
    };
  }
}
