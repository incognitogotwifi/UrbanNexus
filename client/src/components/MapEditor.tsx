import { useState, useEffect, useRef } from 'react';
import { useGameWorld } from '../lib/stores/useGameWorld';
import { MapTile, GameMap, NPC, SpawnPoint } from '../types/game';
import { TILE_SIZE, generateId } from '../lib/gameUtils';

interface MapEditorProps {
  isVisible: boolean;
  onClose: () => void;
}

type EditMode = 'tiles' | 'npcs' | 'spawns' | 'collision';

export default function MapEditor({ isVisible, onClose }: MapEditorProps) {
  const [editMode, setEditMode] = useState<EditMode>('tiles');
  const [selectedTileType, setSelectedTileType] = useState<string>('floor');
  const [selectedTexture, setSelectedTexture] = useState<string>('/textures/grass.png');
  const [selectedNPCType, setSelectedNPCType] = useState<string>('neutral');
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(1);
  const [gridSize, setGridSize] = useState<number>(32);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCollision, setShowCollision] = useState<boolean>(true);
  const [mapName, setMapName] = useState<string>('New Map');
  const [mapWidth, setMapWidth] = useState<number>(1000);
  const [mapHeight, setMapHeight] = useState<number>(1000);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentMap, addTile, removeTile, setEditing, addNPC, removeNPC, addSpawnPoint, removeSpawnPoint } = useGameWorld();
  
  useEffect(() => {
    setEditing(isVisible);
  }, [isVisible, setEditing]);

  useEffect(() => {
    if (currentMap) {
      setMapName(currentMap.name);
      setMapWidth(currentMap.width);
      setMapHeight(currentMap.height);
    }
  }, [currentMap]);

  useEffect(() => {
    drawCanvas();
  }, [currentMap, editMode, currentLayer, showGrid, showCollision, zoom, pan]);
  
  const availableTextures = [
    { name: 'Grass', path: '/textures/grass.png' },
    { name: 'Asphalt', path: '/textures/asphalt.png' },
    { name: 'Sand', path: '/textures/sand.jpg' },
    { name: 'Wood', path: '/textures/wood.jpg' },
    { name: 'Sky', path: '/textures/sky.png' }
  ];
  
  const tileTypes = [
    { name: 'Floor', value: 'floor', collision: false, color: '#90EE90' },
    { name: 'Wall', value: 'wall', collision: true, color: '#8B4513' },
    { name: 'Object', value: 'object', collision: true, color: '#FFD700' },
    { name: 'Water', value: 'water', collision: true, color: '#4169E1' },
    { name: 'Decoration', value: 'decoration', collision: false, color: '#DDA0DD' }
  ];

  const npcTypes = [
    { name: 'Neutral', value: 'neutral', color: '#808080' },
    { name: 'Merchant', value: 'merchant', color: '#228B22' },
    { name: 'Guard', value: 'guard', color: '#4169E1' },
    { name: 'Enemy', value: 'enemy', color: '#DC143C' },
    { name: 'Quest Giver', value: 'quest', color: '#DAA520' }
  ];

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      for (let x = 0; x <= mapWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mapHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= mapHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(mapWidth, y);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }

    // Draw tiles
    if (currentMap) {
      currentMap.tiles.forEach(tile => {
        if (tile.layer === currentLayer || editMode === 'collision') {
          const tileType = tileTypes.find(t => t.value === tile.type);
          
          if (editMode === 'collision' && showCollision) {
            ctx.fillStyle = tile.collision ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
          } else {
            ctx.fillStyle = tileType?.color || '#FFFFFF';
          }
          
          ctx.fillRect(
            tile.position.x * gridSize,
            tile.position.y * gridSize,
            gridSize,
            gridSize
          );
          
          // Draw tile border
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            tile.position.x * gridSize,
            tile.position.y * gridSize,
            gridSize,
            gridSize
          );
        }
      });

      // Draw NPCs
      if (editMode === 'npcs' && currentMap.npcs) {
        currentMap.npcs.forEach(npc => {
          const npcType = npcTypes.find(t => t.value === npc.type);
          
          ctx.fillStyle = npcType?.color || '#808080';
          ctx.beginPath();
          ctx.arc(npc.position.x, npc.position.y, 16, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw NPC name
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(npc.name, npc.position.x, npc.position.y - 20);
        });
      }

      // Draw spawn points
      if (editMode === 'spawns' && currentMap.spawnPoints) {
        currentMap.spawnPoints.forEach((spawn, index) => {
          ctx.fillStyle = '#00FF00';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.arc(spawn.x, spawn.y, 12, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          
          // Draw spawn number
          ctx.fillStyle = '#000';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText((index + 1).toString(), spawn.x, spawn.y + 3);
        });
      }
    }

    ctx.restore();
  };

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;
    
    return { x, y };
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const coords = getCanvasCoordinates(event);
    
    if (editMode === 'tiles') {
      const tileX = Math.floor(coords.x / gridSize);
      const tileY = Math.floor(coords.y / gridSize);
      
      if (event.button === 0) { // Left click - add tile
        for (let dx = 0; dx < brushSize; dx++) {
          for (let dy = 0; dy < brushSize; dy++) {
            const tile: MapTile = {
              id: generateId(),
              type: selectedTileType as 'floor' | 'wall' | 'object',
              texture: selectedTexture,
              position: { x: tileX + dx, y: tileY + dy },
              collision: tileTypes.find(t => t.value === selectedTileType)?.collision || false,
              layer: currentLayer
            };
            addTile(tile);
          }
        }
      } else if (event.button === 2) { // Right click - remove tile
        event.preventDefault();
        if (currentMap) {
          const tilesToRemove = currentMap.tiles.filter(
            tile => tile.position.x >= tileX && tile.position.x < tileX + brushSize &&
                   tile.position.y >= tileY && tile.position.y < tileY + brushSize &&
                   tile.layer === currentLayer
          );
          tilesToRemove.forEach(tile => removeTile(tile.id));
        }
      }
    } else if (editMode === 'npcs') {
      if (event.button === 0) { // Left click - add NPC
        const npc: NPC = {
          id: generateId(),
          name: `${selectedNPCType} NPC`,
          type: selectedNPCType as any,
          position: { x: coords.x, y: coords.y },
          mapId: currentMap?.id || 'default',
          dialogue: { greeting: 'Hello there!' },
          stats: { health: 100, damage: 0, speed: 0, defense: 0 },
          appearance: { sprite: 'default', color: '#FFFFFF', size: 32 },
          script: '',
          interactions: ['talk']
        };
        addNPC(npc);
      } else if (event.button === 2) { // Right click - remove NPC
        event.preventDefault();
        if (currentMap?.npcs) {
          const npcToRemove = currentMap.npcs.find(npc => {
            const distance = Math.sqrt(
              Math.pow(npc.position.x - coords.x, 2) + 
              Math.pow(npc.position.y - coords.y, 2)
            );
            return distance < 20;
          });
          if (npcToRemove) {
            removeNPC(npcToRemove.id);
          }
        }
      }
    } else if (editMode === 'spawns') {
      if (event.button === 0) { // Left click - add spawn point
        const spawnPoint: SpawnPoint = { x: coords.x, y: coords.y };
        addSpawnPoint(spawnPoint);
      } else if (event.button === 2) { // Right click - remove spawn point
        event.preventDefault();
        if (currentMap?.spawnPoints) {
          const spawnToRemove = currentMap.spawnPoints.findIndex(spawn => {
            const distance = Math.sqrt(
              Math.pow(spawn.x - coords.x, 2) + 
              Math.pow(spawn.y - coords.y, 2)
            );
            return distance < 20;
          });
          if (spawnToRemove !== -1) {
            removeSpawnPoint(spawnToRemove);
          }
        }
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.button === 1) { // Middle mouse button - pan
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const saveMap = async () => {
    if (currentMap) {
      const mapData = {
        ...currentMap,
        name: mapName,
        width: mapWidth,
        height: mapHeight
      };

      try {
        // Save to server for live updates
        const response = await fetch('/api/map/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mapData }),
        });

        if (response.ok) {
          console.log('Map saved to server successfully');
          
          // Also save locally as backup
          const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${mapName.replace(/\s+/g, '_')}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          console.error('Failed to save map to server');
          alert('Failed to save map to server, saved locally instead');
          
          // Fall back to local save
          const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${mapName.replace(/\s+/g, '_')}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error saving map:', error);
        alert('Error saving map to server, saved locally instead');
        
        // Fall back to local save
        const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mapName.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const loadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const mapData = JSON.parse(e.target?.result as string) as GameMap;
        
        // Validate map data structure
        if (!mapData.id || !mapData.name || !Array.isArray(mapData.tiles) || !Array.isArray(mapData.spawnPoints)) {
          alert('Invalid map file format');
          return;
        }

        // Load map into game world
        const { loadMap: loadGameMap } = useGameWorld.getState();
        loadGameMap(mapData);
        
        // Update editor state
        setMapName(mapData.name);
        setMapWidth(mapData.width);
        setMapHeight(mapData.height);
        
        console.log('Map loaded successfully:', mapData.name);
      } catch (error) {
        alert('Error loading map file');
        console.error('Map loading error:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearMap = () => {
    if (confirm('Are you sure you want to clear the entire map?')) {
      // Clear all tiles, NPCs, and spawn points
      if (currentMap) {
        currentMap.tiles.forEach(tile => removeTile(tile.id));
        currentMap.npcs?.forEach(npc => removeNPC(npc.id));
        currentMap.spawnPoints.forEach((_, index) => removeSpawnPoint(index));
      }
    }
  };

  const loadMapFromServer = async (mapId: string) => {
    try {
      const response = await fetch(`/api/map/load/${mapId}`);
      if (response.ok) {
        const mapData = await response.json() as GameMap;
        
        // Load map into game world
        const { loadMap: loadGameMap } = useGameWorld.getState();
        loadGameMap(mapData);
        
        // Update editor state
        setMapName(mapData.name);
        setMapWidth(mapData.width);
        setMapHeight(mapData.height);
        
        console.log('Map loaded from server successfully:', mapData.name);
      } else {
        console.error('Failed to load map from server');
        alert('Failed to load map from server');
      }
    } catch (error) {
      console.error('Error loading map from server:', error);
      alert('Error loading map from server');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-7xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Map Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-4 h-[75vh]">
          {/* Tools Panel */}
          <div className="w-80 bg-gray-800 rounded p-4 overflow-y-auto">
            {/* Map Info */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">Map Settings</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  placeholder="Map Name"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={mapWidth}
                    onChange={(e) => setMapWidth(parseInt(e.target.value))}
                    placeholder="Width"
                    className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <input
                    type="number"
                    value={mapHeight}
                    onChange={(e) => setMapHeight(parseInt(e.target.value))}
                    placeholder="Height"
                    className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Edit Mode */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">Edit Mode</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'tiles', label: 'Tiles', icon: '🟫' },
                  { value: 'npcs', label: 'NPCs', icon: '🤖' },
                  { value: 'spawns', label: 'Spawns', icon: '🎯' },
                  { value: 'collision', label: 'Collision', icon: '🚫' }
                ].map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => setEditMode(mode.value as EditMode)}
                    className={`p-2 rounded text-sm ${
                      editMode === mode.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.icon} {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tile Tools */}
            {editMode === 'tiles' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Tile Type</h3>
                  <select
                    value={selectedTileType}
                    onChange={(e) => setSelectedTileType(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    {tileTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Texture</h3>
                  <select
                    value={selectedTexture}
                    onChange={(e) => setSelectedTexture(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    {availableTextures.map(texture => (
                      <option key={texture.path} value={texture.path}>
                        {texture.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Layer</h3>
                  <input
                    type="number"
                    value={currentLayer}
                    onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
                    min="0"
                    max="10"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>

                <div>
                  <h3 className="font-bold mb-2">Brush Size</h3>
                  <input
                    type="range"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{brushSize}x{brushSize}</span>
                </div>
              </div>
            )}

            {/* NPC Tools */}
            {editMode === 'npcs' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">NPC Type</h3>
                  <select
                    value={selectedNPCType}
                    onChange={(e) => setSelectedNPCType(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    {npcTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-400">
                  Left click to add NPC, right click to remove
                </div>
              </div>
            )}

            {/* Spawn Tools */}
            {editMode === 'spawns' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  Left click to add spawn point, right click to remove
                </div>
                <div className="text-xs text-gray-500">
                  Spawn points: {currentMap?.spawnPoints?.length || 0}
                </div>
              </div>
            )}

            {/* View Options */}
            <div className="mt-6 space-y-2">
              <h3 className="font-bold mb-2">View Options</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Grid</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCollision}
                  onChange={(e) => setShowCollision(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Collision</span>
              </label>
              <div>
                <label className="text-sm">Zoom: {zoom.toFixed(2)}x</label>
                <input
                  type="range"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  min="0.1"
                  max="5"
                  step="0.1"
                  className="w-full"
                />
              </div>
            </div>

            {/* Map Actions */}
            <div className="mt-6 space-y-2">
              <h3 className="font-bold mb-2">Map Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={saveMap}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Save Map
                </button>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={loadMap}
                    className="hidden"
                  />
                  <span className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer block text-center">
                    Load Map File
                  </span>
                </label>
                <button
                  onClick={() => loadMapFromServer('default')}
                  className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                >
                  Load Current Game Map
                </button>
                <button
                  onClick={clearMap}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Clear Map
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-800 rounded overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              onContextMenu={(e) => e.preventDefault()}
              onWheel={handleWheel}
              className="cursor-crosshair w-full h-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-400">
          <strong>Controls:</strong> Left click to add, Right click to remove, Middle mouse to pan, Scroll to zoom
        </div>
      </div>
    </div>
  );
}