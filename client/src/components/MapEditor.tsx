import { useState, useEffect } from 'react';
import { useGameWorld } from '../lib/stores/useGameWorld';
import { MapTile, GameMap } from '../types/game';
import { TILE_SIZE, generateId } from '../lib/gameUtils';

interface MapEditorProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MapEditor({ isVisible, onClose }: MapEditorProps) {
  const [selectedTileType, setSelectedTileType] = useState<string>('floor');
  const [selectedTexture, setSelectedTexture] = useState<string>('/textures/grass.png');
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(1);
  
  const { currentMap, addTile, removeTile, setEditing } = useGameWorld();
  
  useEffect(() => {
    setEditing(isVisible);
  }, [isVisible, setEditing]);
  
  const availableTextures = [
    { name: 'Grass', path: '/textures/grass.png' },
    { name: 'Asphalt', path: '/textures/asphalt.png' },
    { name: 'Sand', path: '/textures/sand.jpg' },
    { name: 'Wood', path: '/textures/wood.jpg' },
    { name: 'Sky', path: '/textures/sky.png' }
  ];
  
  const tileTypes = [
    { name: 'Floor', value: 'floor', collision: false },
    { name: 'Wall', value: 'wall', collision: true },
    { name: 'Object', value: 'object', collision: true }
  ];
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (event.button === 0) { // Left click - add tile
      const tile: MapTile = {
        id: generateId(),
        type: selectedTileType as 'floor' | 'wall' | 'object',
        texture: selectedTexture,
        position: { x: tileX, y: tileY },
        collision: tileTypes.find(t => t.value === selectedTileType)?.collision || false,
        layer: currentLayer
      };
      
      addTile(tile);
    } else if (event.button === 2) { // Right click - remove tile
      event.preventDefault();
      if (currentMap) {
        const tileToRemove = currentMap.tiles.find(
          tile => tile.position.x === tileX && tile.position.y === tileY && tile.layer === currentLayer
        );
        if (tileToRemove) {
          removeTile(tileToRemove.id);
        }
      }
    }
  };
  
  const saveMap = () => {
    if (currentMap) {
      const mapData = JSON.stringify(currentMap, null, 2);
      const blob = new Blob([mapData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentMap.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  const loadMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const mapData: GameMap = JSON.parse(e.target?.result as string);
          // Load map logic would go here
          console.log('Map loaded:', mapData);
        } catch (error) {
          console.error('Error loading map:', error);
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Map Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tile Type</label>
              <select
                value={selectedTileType}
                onChange={(e) => setSelectedTileType(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              >
                {tileTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.name} {type.collision ? '(Collision)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Texture</label>
              <div className="grid grid-cols-2 gap-2">
                {availableTextures.map(texture => (
                  <button
                    key={texture.path}
                    onClick={() => setSelectedTexture(texture.path)}
                    className={`p-2 border rounded ${
                      selectedTexture === texture.path 
                        ? 'border-blue-500 bg-blue-900' 
                        : 'border-gray-600'
                    }`}
                  >
                    <img 
                      src={texture.path} 
                      alt={texture.name}
                      className="w-8 h-8 object-cover mx-auto"
                    />
                    <div className="text-xs mt-1">{texture.name}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Layer</label>
              <input
                type="number"
                value={currentLayer}
                onChange={(e) => setCurrentLayer(parseInt(e.target.value))}
                min="0"
                max="10"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Brush Size</label>
              <input
                type="range"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                min="1"
                max="5"
                className="w-full"
              />
              <div className="text-sm text-gray-400">Size: {brushSize}</div>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 p-4 rounded">
              <canvas
                width={800}
                height={600}
                onClick={handleCanvasClick}
                onContextMenu={(e) => e.preventDefault()}
                className="border border-gray-600 cursor-crosshair"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Left click: Add tile | Right click: Remove tile
            </div>
          </div>
        </div>
        
        {/* File operations */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={saveMap}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Save Map
          </button>
          
          <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors cursor-pointer">
            Load Map
            <input
              type="file"
              accept=".json"
              onChange={loadMap}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => {
              if (currentMap) {
                // Clear map logic
                console.log('Clear map');
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Clear Map
          </button>
        </div>
      </div>
    </div>
  );
}
