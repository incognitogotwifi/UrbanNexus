import { useEffect } from 'react';
import { useWeapons } from '../lib/stores/useWeapons';
import { usePlayer } from '../lib/stores/usePlayer';

export default function WeaponSystem() {
  const { weapons, currentWeapon, loadWeapons, setCurrentWeapon } = useWeapons();
  const { localPlayer, setWeapon } = usePlayer();
  
  useEffect(() => {
    loadWeapons();
  }, [loadWeapons]);
  
  useEffect(() => {
    if (localPlayer) {
      setWeapon(currentWeapon);
    }
  }, [currentWeapon, localPlayer, setWeapon]);
  
  const handleWeaponChange = (weaponId: string) => {
    setCurrentWeapon(weaponId);
  };
  
  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg pointer-events-auto">
      <h3 className="text-sm font-bold mb-2">Weapons</h3>
      
      <div className="space-y-2">
        {Object.values(weapons).map(weapon => (
          <button
            key={weapon.id}
            onClick={() => handleWeaponChange(weapon.id)}
            className={`w-full text-left p-2 rounded text-sm ${
              currentWeapon === weapon.id
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{weapon.name}</span>
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: weapon.color }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Damage: {weapon.damage} | Range: {weapon.range}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        1-4: Switch weapon
      </div>
    </div>
  );
}
