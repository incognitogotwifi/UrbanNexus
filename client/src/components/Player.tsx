import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Player as PlayerType } from '../types/game';

interface PlayerProps {
  player: PlayerType;
  isLocal?: boolean;
  onClick?: (player: PlayerType) => void;
}

export default function Player({ player, isLocal = false, onClick }: PlayerProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Pre-calculate player color
  const playerColor = useMemo(() => player.color, [player.color]);
  
  // Health bar color based on health percentage
  const healthBarColor = useMemo(() => {
    const healthPercent = player.health / player.maxHealth;
    if (healthPercent > 0.6) return '#4ade80'; // Green
    if (healthPercent > 0.3) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  }, [player.health, player.maxHealth]);
  
  // Update position
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = player.position.x;
      meshRef.current.position.y = player.position.y;
      meshRef.current.position.z = 0.5;
    }
  });
  
  if (!player.isAlive) {
    return (
      <group>
        {/* Dead player (darker color) */}
        <mesh ref={meshRef} position={[player.position.x, player.position.y, 0.1]}>
          <boxGeometry args={[20, 20, 2]} />
          <meshStandardMaterial color={playerColor} opacity={0.3} transparent />
        </mesh>
        
        {/* Death marker */}
        <mesh position={[player.position.x, player.position.y, 1]}>
          <boxGeometry args={[24, 24, 1]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  }
  
  return (
    <group>
      {/* Player body */}
      <mesh 
        ref={meshRef} 
        position={[player.position.x, player.position.y, 0.5]}
        onClick={() => onClick && onClick(player)}
      >
        <boxGeometry args={[20, 20, 4]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Local player indicator */}
      {isLocal && (
        <mesh position={[player.position.x, player.position.y, 2]}>
          <boxGeometry args={[24, 24, 1]} />
          <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
        </mesh>
      )}
      
      {/* Gang indicator */}
      {player.gangId && (
        <mesh position={[player.position.x, player.position.y - 15, 1]}>
          <boxGeometry args={[16, 4, 1]} />
          <meshStandardMaterial color={playerColor} />
        </mesh>
      )}
      
      {/* Health bar background */}
      <mesh position={[player.position.x, player.position.y + 20, 1]}>
        <boxGeometry args={[20, 4, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Health bar fill */}
      <mesh position={[player.position.x - 10 + (player.health / player.maxHealth) * 10, player.position.y + 20, 1.1]}>
        <boxGeometry args={[(player.health / player.maxHealth) * 20, 3, 1]} />
        <meshStandardMaterial color={healthBarColor} />
      </mesh>
      
      {/* Username display */}
      <mesh position={[player.position.x, player.position.y + 30, 1]}>
        <boxGeometry args={[player.username.length * 3, 6, 1]} />
        <meshStandardMaterial color="#000000" opacity={0.7} transparent />
      </mesh>
    </group>
  );
}
