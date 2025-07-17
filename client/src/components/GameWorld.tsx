import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useGameWorld } from '../lib/stores/useGameWorld';
import { GameMap, MapTile } from '../types/game';
import { TILE_SIZE } from '../lib/gameUtils';

interface GameWorldProps {
  map: GameMap;
}

interface TileRendererProps {
  tile: MapTile;
}

function TileRenderer({ tile }: TileRendererProps) {
  const texture = useTexture(tile.texture);
  
  return (
    <mesh 
      position={[
        tile.position.x * TILE_SIZE + TILE_SIZE / 2, 
        tile.position.y * TILE_SIZE + TILE_SIZE / 2, 
        tile.layer * 0.1
      ]}
    >
      <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default function GameWorld({ map }: GameWorldProps) {
  const { loadMap } = useGameWorld();
  
  useEffect(() => {
    loadMap(map);
  }, [map, loadMap]);
  
  // Sort tiles by layer for proper rendering
  const sortedTiles = useMemo(() => {
    return [...map.tiles].sort((a, b) => a.layer - b.layer);
  }, [map.tiles]);
  
  return (
    <group>
      {/* Render map tiles */}
      {sortedTiles.map((tile) => (
        <TileRenderer key={tile.id} tile={tile} />
      ))}
      
      {/* Spawn point indicators (only visible in edit mode) */}
      {map.spawnPoints.map((spawnPoint, index) => (
        <mesh 
          key={`spawn-${index}`}
          position={[spawnPoint.x, spawnPoint.y, 2]}
        >
          <boxGeometry args={[16, 16, 2]} />
          <meshStandardMaterial color="#00ff00" opacity={0.5} transparent />
        </mesh>
      ))}
    </group>
  );
}
