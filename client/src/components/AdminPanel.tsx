import { useState, useEffect } from 'react';
import { useMultiplayer } from '../lib/stores/useMultiplayer';

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
  userRole: 'MOD' | 'STAFF' | 'ADMIN';
}

interface PlayerAction {
  type: 'kick' | 'ban' | 'mute' | 'teleport' | 'heal' | 'give_item';
  playerId: string;
  reason?: string;
  duration?: number;
  itemId?: string;
}

export default function AdminPanel({ isVisible, onClose, userRole }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'players' | 'logs' | 'settings'>('players');
  const [serverStats, setServerStats] = useState({
    playersOnline: 0,
    totalPlayers: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  
  const { gameState } = useMultiplayer();
  
  useEffect(() => {
    // Mock server stats update
    const interval = setInterval(() => {
      setServerStats({
        playersOnline: gameState ? Object.keys(gameState.players).length : 0,
        totalPlayers: 1234,
        uptime: Date.now() - 1000000,
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [gameState]);
  
  const executePlayerAction = (action: PlayerAction) => {
    console.log('Executing admin action:', action);
    // Here you would send the action to the server
    alert(`Action executed: ${action.type} on player ${action.playerId}`);
  };
  
  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Admin Panel - {userRole}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Server Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-sm text-gray-400">Players Online</div>
            <div className="text-2xl font-bold text-green-400">{serverStats.playersOnline}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-sm text-gray-400">Total Players</div>
            <div className="text-2xl font-bold">{serverStats.totalPlayers}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-sm text-gray-400">Uptime</div>
            <div className="text-2xl font-bold text-blue-400">{formatUptime(serverStats.uptime)}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-sm text-gray-400">Memory Usage</div>
            <div className="text-2xl font-bold text-yellow-400">{serverStats.memoryUsage.toFixed(1)}%</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <div className="text-sm text-gray-400">CPU Usage</div>
            <div className="text-2xl font-bold text-red-400">{serverStats.cpuUsage.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-4">
          {(['players', 'logs', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-blue-500 text-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Online Players</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4">Player</th>
                      <th className="text-left p-4">Health</th>
                      <th className="text-left p-4">Gang</th>
                      <th className="text-left p-4">K/D</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameState && Object.values(gameState.players).map(player => (
                      <tr key={player.id} className="border-b border-gray-700">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: player.color }}
                            />
                            <span>{player.username}</span>
                            {!player.isAlive && (
                              <span className="text-red-400 text-sm">(Dead)</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-600 rounded">
                              <div 
                                className="h-full bg-red-500 rounded"
                                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm">{player.health}/{player.maxHealth}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {player.gangId ? (
                            <span className="text-sm px-2 py-1 bg-gray-700 rounded">
                              {gameState.gangs[player.gangId]?.name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {player.kills}/{player.deaths} ({player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills})
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => executePlayerAction({ type: 'kick', playerId: player.id })}
                              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                            >
                              Kick
                            </button>
                            
                            {userRole === 'STAFF' || userRole === 'ADMIN' ? (
                              <>
                                <button
                                  onClick={() => executePlayerAction({ type: 'ban', playerId: player.id })}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                                >
                                  Ban
                                </button>
                                
                                <button
                                  onClick={() => executePlayerAction({ type: 'heal', playerId: player.id })}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                                >
                                  Heal
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Server Logs</h3>
              </div>
              
              <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto">
                <div className="text-green-400">[INFO] Server started successfully</div>
                <div className="text-blue-400">[DEBUG] Player joined: TestPlayer</div>
                <div className="text-yellow-400">[WARN] High CPU usage detected</div>
                <div className="text-red-400">[ERROR] Player disconnected unexpectedly</div>
                <div className="text-gray-400">[TRACE] Bullet collision detected</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Server Settings</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Players</label>
                  <input
                    type="number"
                    defaultValue="50"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Server Name</label>
                  <input
                    type="text"
                    defaultValue="Urban MMO Server"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">PvP Enabled</label>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Auto-Restart Time (hours)</label>
                  <input
                    type="number"
                    defaultValue="24"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  />
                </div>
                
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
