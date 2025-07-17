import { useState } from 'react';
import { useGang } from '../lib/stores/useGang';
import { useMultiplayer } from '../lib/stores/useMultiplayer';
import { usePlayer } from '../lib/stores/usePlayer';

interface GangSystemProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function GangSystem({ isVisible, onClose }: GangSystemProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'manage'>('join');
  const [gangName, setGangName] = useState('');
  const [selectedGang, setSelectedGang] = useState<string | null>(null);
  
  const { gangs, currentGang, createGang, joinGang, leaveGang } = useGang();
  const { localPlayer } = usePlayer();
  const { sendEvent } = useMultiplayer();
  
  const handleCreateGang = () => {
    if (gangName.trim() && localPlayer) {
      createGang(gangName.trim(), localPlayer.id);
      sendEvent({
        type: 'GANG_CREATE',
        payload: {
          gang: {
            id: '',
            name: gangName.trim(),
            leader: localPlayer.id,
            members: [localPlayer.id],
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            territory: { x: 0, y: 0, width: 100, height: 100 },
            score: 0
          }
        }
      });
      setGangName('');
      setActiveTab('manage');
    }
  };
  
  const handleJoinGang = (gangId: string) => {
    if (localPlayer) {
      joinGang(gangId, localPlayer.id);
      sendEvent({
        type: 'GANG_JOIN',
        payload: { playerId: localPlayer.id, gangId }
      });
      setActiveTab('manage');
    }
  };
  
  const handleLeaveGang = () => {
    if (localPlayer) {
      leaveGang(localPlayer.id);
      setActiveTab('join');
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Gang System</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-4">
          {(['create', 'join', 'manage'] as const).map(tab => (
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
        
        {/* Create Gang Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Gang Name</label>
              <input
                type="text"
                value={gangName}
                onChange={(e) => setGangName(e.target.value)}
                placeholder="Enter gang name..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded"
                maxLength={20}
              />
            </div>
            
            <button
              onClick={handleCreateGang}
              disabled={!gangName.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Create Gang
            </button>
            
            <div className="text-sm text-gray-400">
              • Gang names must be unique
              • You will become the gang leader
              • Maximum 4 members per gang
            </div>
          </div>
        )}
        
        {/* Join Gang Tab */}
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-4">
              Available Gangs ({Object.keys(gangs).length})
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.values(gangs).map(gang => (
                <div
                  key={gang.id}
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    selectedGang === gang.id
                      ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedGang(gang.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: gang.color }}
                        />
                        <span className="font-bold">{gang.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Leader: {gang.leader} | Members: {gang.members.length}/4
                      </div>
                      <div className="text-sm text-gray-400">
                        Score: {gang.score}
                      </div>
                    </div>
                    
                    {gang.members.length < 4 && (
                      <div className="text-green-400 text-sm">Open</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => selectedGang && handleJoinGang(selectedGang)}
              disabled={!selectedGang}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              Join Selected Gang
            </button>
          </div>
        )}
        
        {/* Manage Gang Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-4">
            {currentGang ? (
              <>
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: currentGang.color }}
                    />
                    <h3 className="text-xl font-bold">{currentGang.name}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Leader: {currentGang.leader} | Members: {currentGang.members.length}/4 | Score: {currentGang.score}
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2">Members</h4>
                  <div className="space-y-2">
                    {currentGang.members.map(memberId => (
                      <div key={memberId} className="flex justify-between items-center">
                        <span>{memberId}</span>
                        <div className="flex gap-2">
                          {memberId === currentGang.leader && (
                            <span className="text-yellow-400 text-sm">Leader</span>
                          )}
                          {currentGang.leader === localPlayer?.id && memberId !== localPlayer.id && (
                            <button className="text-red-400 hover:text-red-300 text-sm">
                              Kick
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="font-semibold mb-2">Territory</h4>
                  <div className="text-sm text-gray-400">
                    Position: ({currentGang.territory.x}, {currentGang.territory.y})
                  </div>
                  <div className="text-sm text-gray-400">
                    Size: {currentGang.territory.width} × {currentGang.territory.height}
                  </div>
                </div>
                
                <button
                  onClick={handleLeaveGang}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Leave Gang
                </button>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <p>You are not in a gang.</p>
                <p>Create a new gang or join an existing one.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
