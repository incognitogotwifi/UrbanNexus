import { create } from 'zustand';
import { GameMap, MapTile, NPC, SpawnPoint } from '../../types/game';

interface GameWorldState {
  currentMap: GameMap | null;
  isEditing: boolean;
  selectedTile: string | null;
  
  // Actions
  loadMap: (map: GameMap) => void;
  setEditing: (editing: boolean) => void;
  setSelectedTile: (tileId: string) => void;
  addTile: (tile: MapTile) => void;
  removeTile: (tileId: string) => void;
  updateTile: (tileId: string, updates: Partial<MapTile>) => void;
  addNPC: (npc: NPC) => void;
  removeNPC: (npcId: string) => void;
  addSpawnPoint: (spawnPoint: SpawnPoint) => void;
  removeSpawnPoint: (index: number) => void;
  updateMapSettings: (updates: Partial<GameMap>) => void;
  checkCollision: (x: number, y: number) => boolean;
  getSpawnPoint: () => { x: number; y: number };
}

export const useGameWorld = create<GameWorldState>((set, get) => ({
  currentMap: null,
  isEditing: false,
  selectedTile: null,
  
  loadMap: (map: GameMap) => {
    set({ currentMap: map });
  },
  
  setEditing: (editing: boolean) => {
    set({ isEditing: editing });
  },
  
  setSelectedTile: (tileId: string) => {
    set({ selectedTile: tileId });
  },
  
  addTile: (tile: MapTile) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          tiles: [...state.currentMap.tiles, tile]
        }
      };
    });
  },
  
  removeTile: (tileId: string) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          tiles: state.currentMap.tiles.filter(tile => tile.id !== tileId)
        }
      };
    });
  },
  
  updateTile: (tileId: string, updates: Partial<MapTile>) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          tiles: state.currentMap.tiles.map(tile =>
            tile.id === tileId ? { ...tile, ...updates } : tile
          )
        }
      };
    });
  },

  addNPC: (npc: NPC) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          npcs: [...(state.currentMap.npcs || []), npc]
        }
      };
    });
  },

  removeNPC: (npcId: string) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          npcs: (state.currentMap.npcs || []).filter(npc => npc.id !== npcId)
        }
      };
    });
  },

  addSpawnPoint: (spawnPoint: SpawnPoint) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          spawnPoints: [...state.currentMap.spawnPoints, spawnPoint]
        }
      };
    });
  },

  removeSpawnPoint: (index: number) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          spawnPoints: state.currentMap.spawnPoints.filter((_, i) => i !== index)
        }
      };
    });
  },

  updateMapSettings: (updates: Partial<GameMap>) => {
    set((state) => {
      if (!state.currentMap) return state;
      
      return {
        currentMap: {
          ...state.currentMap,
          ...updates
        }
      };
    });
  },
  
  checkCollision: (x: number, y: number) => {
    const { currentMap } = get();
    if (!currentMap) return false;
    
    const tileSize = 32; // 32x32 pixel tiles
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    
    return currentMap.tiles.some(tile => 
      tile.collision && 
      tile.position.x === tileX && 
      tile.position.y === tileY
    );
  },
  
  getSpawnPoint: () => {
    const { currentMap } = get();
    if (!currentMap || currentMap.spawnPoints.length === 0) {
      return { x: 0, y: 0 };
    }
    
    const randomIndex = Math.floor(Math.random() * currentMap.spawnPoints.length);
    return currentMap.spawnPoints[randomIndex];
  }
}));
