import { create } from 'zustand';
import { Weapon } from '../../types/game';

interface WeaponState {
  weapons: Record<string, Weapon>;
  currentWeapon: string;
  
  // Actions
  loadWeapons: () => Promise<void>;
  setCurrentWeapon: (weaponId: string) => void;
  getWeapon: (weaponId: string) => Weapon | null;
  getWeaponDamage: (weaponId: string) => number;
  getWeaponFireRate: (weaponId: string) => number;
}

export const useWeapons = create<WeaponState>((set, get) => ({
  weapons: {},
  currentWeapon: 'pistol',
  
  loadWeapons: async () => {
    try {
      const response = await fetch('/weapons/weapons.json');
      const weaponData = await response.json();
      
      const weaponsMap: Record<string, Weapon> = {};
      weaponData.forEach((weapon: Weapon) => {
        weaponsMap[weapon.id] = weapon;
      });
      
      set({ weapons: weaponsMap });
    } catch (error) {
      console.error('Error loading weapons:', error);
    }
  },
  
  setCurrentWeapon: (weaponId: string) => {
    const { weapons } = get();
    if (weapons[weaponId]) {
      set({ currentWeapon: weaponId });
    }
  },
  
  getWeapon: (weaponId: string) => {
    const { weapons } = get();
    return weapons[weaponId] || null;
  },
  
  getWeaponDamage: (weaponId: string) => {
    const { weapons } = get();
    return weapons[weaponId]?.damage || 25;
  },
  
  getWeaponFireRate: (weaponId: string) => {
    const { weapons } = get();
    return weapons[weaponId]?.fireRate || 300;
  }
}));
