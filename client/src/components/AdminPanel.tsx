import { useState, useEffect } from 'react';
import { useMultiplayer } from '../lib/stores/useMultiplayer';
import { AdminRoleType, AdminPermission } from '../types/game';
import { ADMIN_ROLES, hasPermission, canAssignRole, getPermissionsByCategory } from '../lib/adminRoles';
import MapEditor from './MapEditor';
import AdminWeaponManager from './AdminWeaponManager';
import ServerConfig from './ServerConfig';
import GameFileBrowser from './GameFileBrowser';
import ScriptingEnvironment from './ScriptingEnvironment';
import NPCManager from './NPCManager';
import PlayerLogs from './PlayerLogs';

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
  userRole: AdminRoleType;
}

interface PlayerAction {
  type: 'kick' | 'ban' | 'mute' | 'heal' | 'teleport' | 'modify';
  playerId: string;
  reason?: string;
  duration?: number;
  itemId?: string;
}

export default function AdminPanel({ isVisible, onClose, userRole }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'content' | 'development' | 'system' | 'roles'>('overview');
  const [selectedPlayerForRole, setSelectedPlayerForRole] = useState<string | null>(null);
  const [newRoleForPlayer, setNewRoleForPlayer] = useState<AdminRoleType>('player');
  const [activeSubTool, setActiveSubTool] = useState<string | null>(null);
  const [serverStats, setServerStats] = useState({
    playersOnline: 0,
    totalPlayers: 0,
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  
  const { gameState } = useMultiplayer();
  const currentRole = ADMIN_ROLES[userRole];
  
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
  
  const renderSubTool = () => {
    switch (activeSubTool) {
      case 'map_editor':
        return <MapEditor isVisible={true} onClose={() => setActiveSubTool(null)} />;
      case 'weapon_manager':
        return <AdminWeaponManager onClose={() => setActiveSubTool(null)} />;
      case 'server_config':
        return <ServerConfig onClose={() => setActiveSubTool(null)} />;
      case 'file_browser':
        return <GameFileBrowser onClose={() => setActiveSubTool(null)} userRole={userRole} />;
      case 'scripting_env':
        return <ScriptingEnvironment onClose={() => setActiveSubTool(null)} userRole={userRole} />;
      case 'npc_manager':
        return <NPCManager onClose={() => setActiveSubTool(null)} userRole={userRole} />;
      case 'player_logs':
        return <PlayerLogs onClose={() => setActiveSubTool(null)} userRole={userRole} />;
      default:
        return null;
    }
  };
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      {activeSubTool && renderSubTool()}
      {!activeSubTool && (
        <div className="bg-gray-900 text-white p-6 rounded-lg max-w-7xl max-h-[90vh] overflow-y-auto w-full mx-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">Admin Panel</h2>
              <p className="text-sm" style={{ color: currentRole.color }}>
                {currentRole.name} (Level {currentRole.level})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
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
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded overflow-x-auto">
            {(['overview', 'players', 'content', 'development', 'system', 'roles'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hasPermission(userRole, 'map_edit') && (
                    <button
                      onClick={() => setActiveSubTool('map_editor')}
                      className="bg-green-600 hover:bg-green-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">Map Editor</div>
                      <div className="text-sm text-green-200">Create and edit game maps</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'weapon_edit') && (
                    <button
                      onClick={() => setActiveSubTool('weapon_manager')}
                      className="bg-red-600 hover:bg-red-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">Weapon Manager</div>
                      <div className="text-sm text-red-200">Manage weapons and stats</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'npc_create') && (
                    <button
                      onClick={() => setActiveSubTool('npc_manager')}
                      className="bg-purple-600 hover:bg-purple-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">NPC Manager</div>
                      <div className="text-sm text-purple-200">Create and manage NPCs</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'file_browser') && (
                    <button
                      onClick={() => setActiveSubTool('file_browser')}
                      className="bg-yellow-600 hover:bg-yellow-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">File Browser</div>
                      <div className="text-sm text-yellow-200">Browse game files</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'script_create') && (
                    <button
                      onClick={() => setActiveSubTool('scripting_env')}
                      className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">Scripting Environment</div>
                      <div className="text-sm text-indigo-200">Write and test scripts</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'server_config') && (
                    <button
                      onClick={() => setActiveSubTool('server_config')}
                      className="bg-gray-600 hover:bg-gray-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">Server Config</div>
                      <div className="text-sm text-gray-200">Configure server settings</div>
                    </button>
                  )}
                  {hasPermission(userRole, 'view_logs') && (
                    <button
                      onClick={() => setActiveSubTool('player_logs')}
                      className="bg-cyan-600 hover:bg-cyan-700 p-4 rounded text-left"
                    >
                      <div className="text-lg font-bold">Player Logs</div>
                      <div className="text-sm text-cyan-200">View player activity logs</div>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'players' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Player Management</h3>
                {gameState && Object.keys(gameState.players).length > 0 ? (
                  <div className="space-y-2">
                    {Object.values(gameState.players).map((player) => (
                      <div key={player.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          <div>
                            <div className="font-medium">{player.username}</div>
                            <div className="text-sm text-gray-400">
                              Health: {player.health}/{player.maxHealth} | 
                              Kills: {player.kills} | 
                              Deaths: {player.deaths}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {hasPermission(userRole, 'player_heal') && (
                            <button
                              onClick={() => executePlayerAction({ type: 'heal', playerId: player.id })}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                            >
                              Heal
                            </button>
                          )}
                          {hasPermission(userRole, 'player_teleport') && (
                            <button
                              onClick={() => executePlayerAction({ type: 'teleport', playerId: player.id })}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Teleport
                            </button>
                          )}
                          {hasPermission(userRole, 'player_kick') && (
                            <button
                              onClick={() => executePlayerAction({ type: 'kick', playerId: player.id })}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                            >
                              Kick
                            </button>
                          )}
                          {hasPermission(userRole, 'player_ban') && (
                            <button
                              onClick={() => executePlayerAction({ type: 'ban', playerId: player.id })}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              Ban
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No players currently online
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'content' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Content Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasPermission(userRole, 'map_edit') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Maps</h4>
                      <p className="text-sm text-gray-400 mb-3">Create and edit game maps</p>
                      <button
                        onClick={() => setActiveSubTool('map_editor')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Open Map Editor
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'npc_create') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">NPCs</h4>
                      <p className="text-sm text-gray-400 mb-3">Create and manage NPCs</p>
                      <button
                        onClick={() => setActiveSubTool('npc_manager')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        Manage NPCs
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'weapon_edit') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Weapons</h4>
                      <p className="text-sm text-gray-400 mb-3">Manage weapon properties</p>
                      <button
                        onClick={() => setActiveSubTool('weapon_manager')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Weapon Manager
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'asset_manage') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Assets</h4>
                      <p className="text-sm text-gray-400 mb-3">Manage game assets</p>
                      <button
                        onClick={() => setActiveSubTool('file_browser')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'development' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Development Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasPermission(userRole, 'script_create') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Scripting Environment</h4>
                      <p className="text-sm text-gray-400 mb-3">Write and test game scripts</p>
                      <button
                        onClick={() => setActiveSubTool('scripting_env')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                      >
                        Open Scripting
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'file_browser') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">File Browser</h4>
                      <p className="text-sm text-gray-400 mb-3">Browse and edit game files</p>
                      <button
                        onClick={() => setActiveSubTool('file_browser')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'debug_mode') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Debug Tools</h4>
                      <p className="text-sm text-gray-400 mb-3">Debug game systems</p>
                      <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded">
                        Enable Debug Mode
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'system' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">System Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasPermission(userRole, 'server_config') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Server Configuration</h4>
                      <p className="text-sm text-gray-400 mb-3">Configure server settings</p>
                      <button
                        onClick={() => setActiveSubTool('server_config')}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                      >
                        Configure Server
                      </button>
                    </div>
                  )}
                  {hasPermission(userRole, 'logs_view') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Server Logs</h4>
                      <div className="bg-gray-900 p-3 rounded font-mono text-sm mb-3 max-h-32 overflow-y-auto">
                        <div className="text-green-400">[INFO] Game server started</div>
                        <div className="text-blue-400">[DEBUG] Player connected</div>
                        <div className="text-yellow-400">[WARN] High memory usage</div>
                      </div>
                    </div>
                  )}
                  {hasPermission(userRole, 'analytics_view') && (
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Analytics</h4>
                      <p className="text-sm text-gray-400 mb-3">View game analytics</p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        View Analytics
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'roles' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Role Management</h3>
                {hasPermission(userRole, 'role_assign') ? (
                  <div>
                    <div className="bg-gray-800 p-4 rounded mb-4">
                      <h4 className="font-bold mb-2">Available Roles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(ADMIN_ROLES).map(([roleId, role]) => (
                          <div key={roleId} className="bg-gray-700 p-3 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium" style={{ color: role.color }}>
                                  {role.name}
                                </div>
                                <div className="text-sm text-gray-400">Level {role.level}</div>
                              </div>
                              {canAssignRole(userRole, roleId as AdminRoleType) && (
                                <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <h4 className="font-bold mb-2">Your Permissions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentRole.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm">{permission.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    You don't have permission to manage roles
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}