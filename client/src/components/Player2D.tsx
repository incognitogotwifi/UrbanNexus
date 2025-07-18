import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types/game';

interface PlayerAppearance {
  head: string;
  torso: string;
  legs: string;
  arms: string;
  feet: string;
  ears: string;
  fingers: string;
  // Accessories
  hat?: string;
  earrings?: string;
  gloves?: string;
  mask?: string;
  wristWear?: string;
  eyeWear?: string;
  rings?: string;
  shoes?: string;
  pants?: string;
  shirt?: string;
}

interface Player2DProps {
  player: Player;
  onClick?: () => void;
  scale?: number;
  showHealthBar?: boolean;
  showUsername?: boolean;
}

const defaultAppearance: PlayerAppearance = {
  head: 'default_head',
  torso: 'default_torso',
  legs: 'default_legs',
  arms: 'default_arms',
  feet: 'default_feet',
  ears: 'default_ears',
  fingers: 'default_fingers',
  shirt: 'basic_shirt',
  pants: 'basic_pants',
  shoes: 'basic_shoes'
};

export default function Player2D({ player, onClick, scale = 1, showHealthBar = true, showUsername = true }: Player2DProps) {
  const [appearance] = useState<PlayerAppearance>((player as any).appearance || defaultAppearance);
  const [isHovered, setIsHovered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPlayer = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Base dimensions
    const baseWidth = 32;
    const baseHeight = 48;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Scale factor
    const scaleX = (width * 0.8) / baseWidth;
    const scaleY = (height * 0.8) / baseHeight;
    
    // Colors based on appearance
    const skinColor = getSkinColor(appearance.head);
    const shirtColor = getClothingColor(appearance.shirt);
    const pantsColor = getClothingColor(appearance.pants);
    const shoeColor = getClothingColor(appearance.shoes);
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(centerX - 12 * scaleX, centerY + 20 * scaleY, 24 * scaleX, 4 * scaleY);
    
    // Draw feet/shoes
    ctx.fillStyle = shoeColor;
    ctx.fillRect(centerX - 10 * scaleX, centerY + 14 * scaleY, 8 * scaleX, 6 * scaleY);
    ctx.fillRect(centerX + 2 * scaleX, centerY + 14 * scaleY, 8 * scaleX, 6 * scaleY);
    
    // Draw legs
    ctx.fillStyle = pantsColor;
    ctx.fillRect(centerX - 8 * scaleX, centerY + 2 * scaleY, 6 * scaleX, 12 * scaleY);
    ctx.fillRect(centerX + 2 * scaleX, centerY + 2 * scaleY, 6 * scaleX, 12 * scaleY);
    
    // Draw torso
    ctx.fillStyle = shirtColor;
    ctx.fillRect(centerX - 8 * scaleX, centerY - 8 * scaleY, 16 * scaleX, 10 * scaleY);
    
    // Draw arms
    ctx.fillStyle = skinColor;
    ctx.fillRect(centerX - 12 * scaleX, centerY - 6 * scaleY, 4 * scaleX, 12 * scaleY);
    ctx.fillRect(centerX + 8 * scaleX, centerY - 6 * scaleY, 4 * scaleX, 12 * scaleY);
    
    // Draw gloves if equipped
    if (appearance.gloves) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(centerX - 12 * scaleX, centerY + 2 * scaleY, 4 * scaleX, 4 * scaleY);
      ctx.fillRect(centerX + 8 * scaleX, centerY + 2 * scaleY, 4 * scaleX, 4 * scaleY);
    }
    
    // Draw head
    ctx.fillStyle = skinColor;
    ctx.fillRect(centerX - 6 * scaleX, centerY - 18 * scaleY, 12 * scaleX, 10 * scaleY);
    
    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(centerX - 4 * scaleX, centerY - 15 * scaleY, 2 * scaleX, 2 * scaleY);
    ctx.fillRect(centerX + 2 * scaleX, centerY - 15 * scaleY, 2 * scaleX, 2 * scaleY);
    
    // Draw eyewear if equipped
    if (appearance.eyeWear) {
      ctx.fillStyle = '#000';
      ctx.fillRect(centerX - 6 * scaleX, centerY - 16 * scaleY, 12 * scaleX, 4 * scaleY);
    }
    
    // Draw hat if equipped
    if (appearance.hat) {
      ctx.fillStyle = getAccessoryColor(appearance.hat);
      ctx.fillRect(centerX - 8 * scaleX, centerY - 22 * scaleY, 16 * scaleX, 6 * scaleY);
    }
    
    // Draw mask if equipped
    if (appearance.mask) {
      ctx.fillStyle = '#000';
      ctx.fillRect(centerX - 4 * scaleX, centerY - 12 * scaleY, 8 * scaleX, 6 * scaleY);
    }
    
    // Draw health indicator if player is hurt
    if (player.health < player.maxHealth) {
      const healthPercent = player.health / player.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#f87171';
      ctx.fillRect(centerX - 8 * scaleX, centerY - 24 * scaleY, 16 * scaleX * healthPercent, 2 * scaleY);
      
      ctx.fillStyle = '#374151';
      ctx.fillRect(centerX - 8 * scaleX + 16 * scaleX * healthPercent, centerY - 24 * scaleY, 16 * scaleX * (1 - healthPercent), 2 * scaleY);
    }
    
    // Draw outline if hovered
    if (isHovered) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 12 * scaleX, centerY - 22 * scaleY, 24 * scaleX, 40 * scaleY);
    }
    
    // Draw dead indicator
    if (!player.isAlive) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw X over player
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 10 * scaleX, centerY - 10 * scaleY);
      ctx.lineTo(centerX + 10 * scaleX, centerY + 10 * scaleY);
      ctx.moveTo(centerX + 10 * scaleX, centerY - 10 * scaleY);
      ctx.lineTo(centerX - 10 * scaleX, centerY + 10 * scaleY);
      ctx.stroke();
    }
  };

  const getSkinColor = (headType: string): string => {
    switch (headType) {
      case 'pale_head': return '#fdbcb4';
      case 'tan_head': return '#d2b48c';
      case 'dark_head': return '#8b4513';
      default: return '#ffdbac';
    }
  };

  const getClothingColor = (clothingType?: string): string => {
    if (!clothingType) return '#6b7280';
    
    switch (clothingType) {
      case 'basic_shirt': return '#3b82f6';
      case 'hoodie': return '#6b7280';
      case 'tank_top': return '#ffffff';
      case 'suit_jacket': return '#1f2937';
      case 'basic_pants': return '#1f2937';
      case 'jeans': return '#1e40af';
      case 'shorts': return '#059669';
      case 'suit_pants': return '#000000';
      case 'basic_shoes': return '#000000';
      default: return '#6b7280';
    }
  };

  const getAccessoryColor = (accessoryType: string): string => {
    switch (accessoryType) {
      case 'baseball_cap': return '#dc2626';
      case 'beanie': return '#7c3aed';
      case 'fedora': return '#1f2937';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawPlayer(ctx, canvas.width, canvas.height);
  }, [player, appearance, isHovered]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={64 * scale}
        height={96 * scale}
        className={`cursor-pointer transition-transform ${isHovered ? 'scale-110' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          imageRendering: 'pixelated',
          filter: !player.isAlive ? 'grayscale(100%)' : 'none'
        }}
      />
      
      {showUsername && (
        <div className="absolute -bottom-6 text-xs text-white bg-black/50 px-2 py-1 rounded">
          {player.username}
        </div>
      )}
      
      {showHealthBar && player.health < player.maxHealth && (
        <div className="absolute -top-4 w-full">
          <div className="w-full h-1 bg-gray-600 rounded-full">
            <div 
              className={`h-full rounded-full transition-all duration-200 ${
                player.health / player.maxHealth > 0.5 ? 'bg-green-500' : 
                player.health / player.maxHealth > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}