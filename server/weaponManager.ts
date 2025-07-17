import { Weapon } from '../client/src/types/game';

export class WeaponManager {
  private weapons: Map<string, Weapon> = new Map();
  
  constructor() {
    this.initializeWeapons();
  }
  
  private initializeWeapons(): void {
    const defaultWeapons: Weapon[] = [
      {
        id: 'pistol',
        name: 'Pistol',
        damage: 25,
        fireRate: 300,
        range: 200,
        ammoType: 'pistol',
        sound: 'pistol_shot',
        color: '#8B4513'
      },
      {
        id: 'rifle',
        name: 'Assault Rifle',
        damage: 40,
        fireRate: 150,
        range: 350,
        ammoType: 'rifle',
        sound: 'rifle_shot',
        color: '#2F4F4F'
      },
      {
        id: 'shotgun',
        name: 'Shotgun',
        damage: 60,
        fireRate: 800,
        range: 100,
        ammoType: 'shotgun',
        sound: 'shotgun_shot',
        color: '#8B0000'
      },
      {
        id: 'smg',
        name: 'SMG',
        damage: 20,
        fireRate: 100,
        range: 150,
        ammoType: 'smg',
        sound: 'smg_shot',
        color: '#4B0082'
      },
      {
        id: 'sniper',
        name: 'Sniper Rifle',
        damage: 80,
        fireRate: 1200,
        range: 500,
        ammoType: 'sniper',
        sound: 'sniper_shot',
        color: '#006400'
      },
      {
        id: 'uzi',
        name: 'Uzi',
        damage: 18,
        fireRate: 80,
        range: 120,
        ammoType: 'uzi',
        sound: 'uzi_shot',
        color: '#FFD700'
      },
      {
        id: 'ak47',
        name: 'AK-47',
        damage: 45,
        fireRate: 180,
        range: 320,
        ammoType: 'ak47',
        sound: 'ak47_shot',
        color: '#8B4513'
      },
      {
        id: 'm4a1',
        name: 'M4A1',
        damage: 42,
        fireRate: 160,
        range: 340,
        ammoType: 'm4a1',
        sound: 'm4a1_shot',
        color: '#556B2F'
      },
      {
        id: 'tec9',
        name: 'TEC-9',
        damage: 22,
        fireRate: 120,
        range: 140,
        ammoType: 'tec9',
        sound: 'tec9_shot',
        color: '#800080'
      },
      {
        id: 'thompson',
        name: 'Thompson',
        damage: 35,
        fireRate: 140,
        range: 180,
        ammoType: 'thompson',
        sound: 'thompson_shot',
        color: '#A0522D'
      }
    ];
    
    defaultWeapons.forEach(weapon => {
      this.weapons.set(weapon.id, weapon);
    });
    
    console.log(`[WeaponManager] Initialized ${defaultWeapons.length} weapons`);
  }
  
  public getWeapon(weaponId: string): Weapon {
    const weapon = this.weapons.get(weaponId);
    if (!weapon) {
      console.log(`[WeaponManager] Warning: weapon ${weaponId} not found, using default pistol`);
      return this.weapons.get('pistol')!;
    }
    return weapon;
  }
  
  public getAllWeapons(): Weapon[] {
    return Array.from(this.weapons.values());
  }
  
  public addWeapon(weapon: Weapon): void {
    this.weapons.set(weapon.id, weapon);
    console.log(`[WeaponManager] Added weapon ${weapon.name} (${weapon.id})`);
  }
  
  public removeWeapon(weaponId: string): boolean {
    const success = this.weapons.delete(weaponId);
    if (success) {
      console.log(`[WeaponManager] Removed weapon ${weaponId}`);
    }
    return success;
  }
  
  public updateWeapon(weaponId: string, updates: Partial<Weapon>): boolean {
    const weapon = this.weapons.get(weaponId);
    if (!weapon) {
      console.log(`[WeaponManager] Cannot update weapon: ${weaponId} not found`);
      return false;
    }
    
    Object.assign(weapon, updates);
    console.log(`[WeaponManager] Updated weapon ${weaponId}`);
    return true;
  }
  
  public getWeaponDamage(weaponId: string): number {
    const weapon = this.getWeapon(weaponId);
    return weapon.damage;
  }
  
  public getWeaponFireRate(weaponId: string): number {
    const weapon = this.getWeapon(weaponId);
    return weapon.fireRate;
  }
  
  public getWeaponRange(weaponId: string): number {
    const weapon = this.getWeapon(weaponId);
    return weapon.range;
  }
  
  public getWeaponColor(weaponId: string): string {
    const weapon = this.getWeapon(weaponId);
    return weapon.color;
  }
  
  public isValidWeapon(weaponId: string): boolean {
    return this.weapons.has(weaponId);
  }
  
  public getWeaponsByType(ammoType: string): Weapon[] {
    return Array.from(this.weapons.values()).filter(weapon => weapon.ammoType === ammoType);
  }
  
  public getWeaponStats(): {
    totalWeapons: number;
    avgDamage: number;
    avgFireRate: number;
    avgRange: number;
  } {
    const weapons = Array.from(this.weapons.values());
    
    if (weapons.length === 0) {
      return {
        totalWeapons: 0,
        avgDamage: 0,
        avgFireRate: 0,
        avgRange: 0
      };
    }
    
    const totalDamage = weapons.reduce((sum, weapon) => sum + weapon.damage, 0);
    const totalFireRate = weapons.reduce((sum, weapon) => sum + weapon.fireRate, 0);
    const totalRange = weapons.reduce((sum, weapon) => sum + weapon.range, 0);
    
    return {
      totalWeapons: weapons.length,
      avgDamage: totalDamage / weapons.length,
      avgFireRate: totalFireRate / weapons.length,
      avgRange: totalRange / weapons.length
    };
  }
  
  public getWeaponBalanceAnalysis(): Array<{
    weaponId: string;
    name: string;
    dps: number;
    effectiveRange: number;
    balanceScore: number;
  }> {
    const weapons = Array.from(this.weapons.values());
    
    return weapons.map(weapon => {
      const dps = (weapon.damage * 1000) / weapon.fireRate;
      const effectiveRange = weapon.range;
      const balanceScore = this.calculateBalanceScore(weapon);
      
      return {
        weaponId: weapon.id,
        name: weapon.name,
        dps,
        effectiveRange,
        balanceScore
      };
    }).sort((a, b) => b.balanceScore - a.balanceScore);
  }
  
  private calculateBalanceScore(weapon: Weapon): number {
    // Simple balance scoring algorithm
    const dps = (weapon.damage * 1000) / weapon.fireRate;
    const rangeFactor = weapon.range / 100;
    const fireRateFactor = 1000 / weapon.fireRate;
    
    // Balance score considers DPS, range, and fire rate
    return (dps * 0.4) + (rangeFactor * 0.3) + (fireRateFactor * 0.3);
  }
  
  public exportWeapons(): string {
    const weapons = Array.from(this.weapons.values());
    return JSON.stringify(weapons, null, 2);
  }
  
  public importWeapons(weaponData: string): boolean {
    try {
      const weapons: Weapon[] = JSON.parse(weaponData);
      
      // Validate weapon data
      for (const weapon of weapons) {
        if (!weapon.id || !weapon.name || typeof weapon.damage !== 'number' || 
            typeof weapon.fireRate !== 'number' || typeof weapon.range !== 'number') {
          console.log(`[WeaponManager] Invalid weapon data: ${JSON.stringify(weapon)}`);
          return false;
        }
      }
      
      // Clear existing weapons and add new ones
      this.weapons.clear();
      weapons.forEach(weapon => {
        this.weapons.set(weapon.id, weapon);
      });
      
      console.log(`[WeaponManager] Imported ${weapons.length} weapons`);
      return true;
      
    } catch (error) {
      console.log(`[WeaponManager] Error importing weapons: ${error}`);
      return false;
    }
  }
}
