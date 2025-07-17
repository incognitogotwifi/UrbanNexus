import { create } from 'zustand';
import { Player } from '../../types/game';

interface PlayerState {
  localPlayer: Player | null;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isMoving: boolean;
  lastShot: number;
  
  // Actions
  setPlayer: (player: Player) => void;
  updatePosition: (position: { x: number; y: number }) => void;
  updateVelocity: (velocity: { x: number; y: number }) => void;
  setMoving: (moving: boolean) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  addKill: () => void;
  addDeath: () => void;
  setWeapon: (weapon: string) => void;
  canShoot: () => boolean;
  shoot: () => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  localPlayer: null,
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  isMoving: false,
  lastShot: 0,
  
  setPlayer: (player: Player) => {
    set({ 
      localPlayer: player,
      position: player.position
    });
  },
  
  updatePosition: (position: { x: number; y: number }) => {
    set({ position });
  },
  
  updateVelocity: (velocity: { x: number; y: number }) => {
    set({ velocity });
  },
  
  setMoving: (moving: boolean) => {
    set({ isMoving: moving });
  },
  
  takeDamage: (damage: number) => {
    set((state) => {
      if (!state.localPlayer) return state;
      
      const newHealth = Math.max(0, state.localPlayer.health - damage);
      const isAlive = newHealth > 0;
      
      return {
        localPlayer: {
          ...state.localPlayer,
          health: newHealth,
          isAlive
        }
      };
    });
  },
  
  heal: (amount: number) => {
    set((state) => {
      if (!state.localPlayer) return state;
      
      const newHealth = Math.min(state.localPlayer.maxHealth, state.localPlayer.health + amount);
      
      return {
        localPlayer: {
          ...state.localPlayer,
          health: newHealth,
          isAlive: newHealth > 0
        }
      };
    });
  },
  
  addKill: () => {
    set((state) => {
      if (!state.localPlayer) return state;
      
      return {
        localPlayer: {
          ...state.localPlayer,
          kills: state.localPlayer.kills + 1
        }
      };
    });
  },
  
  addDeath: () => {
    set((state) => {
      if (!state.localPlayer) return state;
      
      return {
        localPlayer: {
          ...state.localPlayer,
          deaths: state.localPlayer.deaths + 1,
          health: 0,
          isAlive: false
        }
      };
    });
  },
  
  setWeapon: (weapon: string) => {
    set((state) => {
      if (!state.localPlayer) return state;
      
      return {
        localPlayer: {
          ...state.localPlayer,
          weapon
        }
      };
    });
  },
  
  canShoot: () => {
    const { localPlayer, lastShot } = get();
    if (!localPlayer || !localPlayer.isAlive || localPlayer.ammo <= 0) return false;
    
    const fireRate = 300; // milliseconds between shots
    return Date.now() - lastShot > fireRate;
  },
  
  shoot: () => {
    const now = Date.now();
    set((state) => {
      if (!state.localPlayer) return state;
      
      return {
        lastShot: now,
        localPlayer: {
          ...state.localPlayer,
          ammo: Math.max(0, state.localPlayer.ammo - 1)
        }
      };
    });
  }
}));
