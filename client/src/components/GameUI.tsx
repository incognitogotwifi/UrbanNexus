import { useMultiplayer } from '../lib/stores/useMultiplayer';
import { usePlayer } from '../lib/stores/usePlayer';
import { useChat } from '../lib/stores/useChat';
import { useGang } from '../lib/stores/useGang';
import Chat from './Chat';

export default function GameUI() {
  const { isConnected, gameState } = useMultiplayer();
  const { localPlayer } = usePlayer();
  const { currentGang } = useGang();
  
  if (!isConnected || !localPlayer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-gray-900 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Connecting...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 pointer-events-auto">
        <div className="flex justify-between items-start">
          {/* Player stats */}
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm opacity-75">Health</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded">
                    <div 
                      className="h-full bg-red-500 rounded transition-all duration-300"
                      style={{ width: `${(localPlayer.health / localPlayer.maxHealth) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{localPlayer.health}/{localPlayer.maxHealth}</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm opacity-75">Ammo</div>
                <div className="text-lg font-bold">{localPlayer.ammo}</div>
              </div>
              
              <div>
                <div className="text-sm opacity-75">Currency</div>
                <div className="text-lg font-bold text-yellow-400">${localPlayer.currency}</div>
              </div>
            </div>
          </div>
          
          {/* Game info */}
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
            <div className="text-sm opacity-75">Players Online</div>
            <div className="text-lg font-bold">
              {gameState ? Object.keys(gameState.players).length : 0}
            </div>
          </div>
        </div>
      </div>
      
      {/* Gang info */}
      {currentGang && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg pointer-events-auto">
          <div className="text-sm opacity-75">Gang</div>
          <div className="text-lg font-bold" style={{ color: currentGang.color }}>
            {currentGang.name}
          </div>
          <div className="text-sm">
            {currentGang.members.length} members
          </div>
        </div>
      )}
      
      {/* Player stats */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg pointer-events-auto">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm opacity-75">Kills</div>
            <div className="text-lg font-bold text-green-400">{localPlayer.kills}</div>
          </div>
          
          <div>
            <div className="text-sm opacity-75">Deaths</div>
            <div className="text-lg font-bold text-red-400">{localPlayer.deaths}</div>
          </div>
          
          <div>
            <div className="text-sm opacity-75">K/D</div>
            <div className="text-lg font-bold">
              {localPlayer.deaths > 0 ? (localPlayer.kills / localPlayer.deaths).toFixed(2) : localPlayer.kills}
            </div>
          </div>
        </div>
      </div>
      
      {/* Weapon info */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg pointer-events-auto">
        <div className="text-sm opacity-75">Weapon</div>
        <div className="text-lg font-bold capitalize">{localPlayer.weapon}</div>
      </div>
      
      {/* Chat */}
      <Chat />
      
      {/* Controls help */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-2 rounded-lg pointer-events-auto">
        <div className="text-xs opacity-75">
          WASD: Move | Mouse: Aim | Click: Shoot | Enter: Chat | Tab: Gang Chat
        </div>
      </div>
    </div>
  );
}
