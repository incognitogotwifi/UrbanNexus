import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Bullet as BulletType } from '../types/game';

interface BulletProps {
  bullet: BulletType;
  onRemove: (bulletId: string) => void;
}

export default function Bullet({ bullet, onRemove }: BulletProps) {
  const meshRef = useRef<Mesh>(null);
  const startTime = useRef(Date.now());
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Move bullet based on direction and speed
      const movement = bullet.speed * delta;
      meshRef.current.position.x += bullet.direction.x * movement;
      meshRef.current.position.y += bullet.direction.y * movement;
      
      // Check if bullet has exceeded its lifetime
      const currentTime = Date.now();
      if (currentTime - startTime.current > bullet.lifetime) {
        onRemove(bullet.id);
      }
    }
  });
  
  // Remove bullet when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return (
    <mesh 
      ref={meshRef} 
      position={[bullet.position.x, bullet.position.y, 0.5]}
    >
      <sphereGeometry args={[2, 8, 8]} />
      <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
    </mesh>
  );
}
