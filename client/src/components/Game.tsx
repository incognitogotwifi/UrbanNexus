import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMultiplayer } from '../lib/stores/useMultiplayer';
import { usePlayer } from '../lib/stores/usePlayer';
import { useGameWorld } from '../lib/stores/useGameWorld';
import { useAudio } from '../lib/stores/useAudio';
import GameWorld from './GameWorld';
import Player from './Player';
import Bullet from './Bullet';
import GameUI from './GameUI';
import MapEditor from './MapEditor';
import AdminPanel from './AdminPanel';
import WeaponSystem from './WeaponSystem';
import GangSystem from './GangSystem';
import PlayerProfile from './PlayerProfile';
import AdminWeaponManager from './AdminWeaponManager';
import ServerConfig from './ServerConfig';
import { GameMap, Player as PlayerType, AdminRoleType } from '../types/game';
import { PLAYER_SPEED, normalizeVector } from '../lib/gameUtils';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
  reload = 'reload',
  run = 'run'
}

const controlsMap = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.shoot, keys: ['Space'] },
  { name: Controls.reload, keys: ['KeyR'] },
  { name: Controls.run, keys: ['ShiftLeft'] }
];

function GameScene({ onPlayerClick }: { onPlayerClick?: (player: PlayerType) => void }) {
  const [, get] = useKeyboardControls();
  const [bullets, setBullets] = useState<any[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { gameState, currentPlayer, movePlayer, shootBullet } = useMultiplayer();
  const { localPlayer, updatePosition, updateVelocity, canShoot, shoot } = usePlayer();
  const { checkCollision } = useGameWorld();
  
  // Handle player movement
  useFrame((state, delta) => {
    if (!localPlayer || !localPlayer.isAlive) return;
    
    const controls = get();
    const velocity = { x: 0, y: 0 };
    
    if (controls.forward) velocity.y += 1;
    if (controls.backward) velocity.y -= 1;
    if (controls.left) velocity.x -= 1;
    if (controls.right) velocity.x += 1;
    
    // Normalize movement vector
    const normalizedVelocity = normalizeVector(velocity);
    const speed = controls.run ? PLAYER_SPEED * 1.5 : PLAYER_SPEED;
    
    // Calculate new position
    const newPosition = {
      x: localPlayer.position.x + normalizedVelocity.x * speed * delta,
      y: localPlayer.position.y + normalizedVelocity.y * speed * delta
    };
    
    // Check collision
    if (!checkCollision(newPosition.x, newPosition.y)) {
      updatePosition(newPosition);
      updateVelocity(normalizedVelocity);
      movePlayer(newPosition);
    }
    
    // Handle shooting
    if (controls.shoot && canShoot()) {
      const direction = normalizeVector({
        x: mousePosition.x - localPlayer.position.x,
        y: mousePosition.y - localPlayer.position.y
      });
      
      shootBullet(direction);
      shoot();
    }
  });
  
  // Handle mouse movement for aiming
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = event.target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert screen coordinates to world coordinates
      const worldX = (x - rect.width / 2) * 2;
      const worldY = (rect.height / 2 - y) * 2;
      
      setMousePosition({ x: worldX, y: worldY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Update bullets from game state
  useEffect(() => {
    if (gameState?.bullets) {
      setBullets(Object.values(gameState.bullets));
    }
  }, [gameState?.bullets]);
  
  const removeBullet = (bulletId: string) => {
    setBullets(prev => prev.filter(bullet => bullet.id !== bulletId));
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Game World */}
      <Suspense fallback={null}>
        {gameState?.currentMap && <GameWorld map={gameState.currentMap} />}
      </Suspense>
      
      {/* Players */}
      {gameState?.players && Object.values(gameState.players).map(player => (
        <Player 
          key={player.id} 
          player={player} 
          isLocal={player.id === currentPlayer?.id}
          onClick={onPlayerClick}
        />
      ))}
      
      {/* Bullets */}
      {bullets.map(bullet => (
        <Bullet 
          key={bullet.id} 
          bullet={bullet} 
          onRemove={removeBullet}
        />
      ))}
      
      {/* Camera follows player */}
      {localPlayer && (
        <group>
          <mesh position={[localPlayer.position.x, localPlayer.position.y, 50]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </>
  );
}

interface GameProps {
  username: string;
  onExit: () => void;
}

export default function Game({ username, onExit }: GameProps) {
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWeaponSystem, setShowWeaponSystem] = useState(true);
  const [showGangSystem, setShowGangSystem] = useState(false);
  const [showPlayerProfile, setShowPlayerProfile] = useState(false);
  const [showWeaponManager, setShowWeaponManager] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType | null>(null);
  const [userRole] = useState<AdminRoleType>('owner'); // Mock role
  
  const { connect, isConnected, gameState, currentPlayer } = useMultiplayer();
  const { playHit } = useAudio();

  const handlePlayerClick = (player: PlayerType) => {
    setSelectedPlayer(player);
    setShowPlayerProfile(true);
  };

  const handleUpdatePlayer = (updates: Partial<PlayerType>) => {
    // In a real implementation, this would send updates to the server
    if (selectedPlayer) {
      setSelectedPlayer({ ...selectedPlayer, ...updates });
    }
  };
  
  useEffect(() => {
    connect(username);
  }, [username, connect]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        setShowMapEditor(!showMapEditor);
      } else if (event.key === 'F2') {
        event.preventDefault();
        setShowAdminPanel(!showAdminPanel);
      } else if (event.key === 'F3') {
        event.preventDefault();
        setShowWeaponSystem(!showWeaponSystem);
      } else if (event.key === 'F4') {
        event.preventDefault();
        setShowGangSystem(!showGangSystem);
      } else if (event.key === 'F5') {
        event.preventDefault();
        setShowWeaponManager(!showWeaponManager);
      } else if (event.key === 'F6') {
        event.preventDefault();
        setShowServerConfig(!showServerConfig);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onExit();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMapEditor, showAdminPanel, showWeaponSystem, showGangSystem, showWeaponManager, showServerConfig, onExit]);
  
  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-4">Connecting to server...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative">
      <KeyboardControls map={controlsMap}>
        <Canvas
          shadows
          camera={{
            position: [0, 0, 100],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          orthographic
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#1a1a1a"]} />
          <GameScene onPlayerClick={handlePlayerClick} />
        </Canvas>
        
        <GameUI />
        
        {showWeaponSystem && <WeaponSystem />}
        
        <MapEditor 
          isVisible={showMapEditor}
          onClose={() => setShowMapEditor(false)}
        />
        
        <AdminPanel 
          isVisible={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          userRole={userRole}
        />
        
        <GangSystem 
          isVisible={showGangSystem}
          onClose={() => setShowGangSystem(false)}
        />
        
        {/* Player Profile Modal */}
        {showPlayerProfile && selectedPlayer && (
          <PlayerProfile
            player={selectedPlayer}
            onClose={() => setShowPlayerProfile(false)}
            onUpdatePlayer={handleUpdatePlayer}
            currentUserRole={userRole}
          />
        )}
        
        {/* Admin Weapon Manager */}
        {showWeaponManager && (
          <AdminWeaponManager
            onClose={() => setShowWeaponManager(false)}
          />
        )}
        
        {/* Server Configuration */}
        {showServerConfig && (
          <ServerConfig
            onClose={() => setShowServerConfig(false)}
          />
        )}
        
        {/* Shortcuts help */}
        <div className="fixed top-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-xs">
          <div>F1: Map Editor</div>
          <div>F2: Admin Panel</div>
          <div>F3: Weapons</div>
          <div>F4: Gang System</div>
          <div>F5: Weapon Manager</div>
          <div>F6: Server Config</div>
          <div>ESC: Exit Game</div>
        </div>
      </KeyboardControls>
    </div>
  );
}
