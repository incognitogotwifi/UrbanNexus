import { useState } from 'react';
import { Player } from '../types/game';

interface PlayerMainMenuProps {
  player: Player;
  onClose: () => void;
}

export default function PlayerMainMenu({ player, onClose }: PlayerMainMenuProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings' | 'help'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'stats', label: 'Statistics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];

  const playerCommands = [
    { command: '/cleartag', description: 'Remove clan tag from your name' },
    { command: '/enter', description: 'Enter a nearby building if your clan owns it' },
    { command: '/getposition', description: 'Get your current position coordinates' },
    { command: '/sethousename [name]', description: 'Set the name of a nearby house' },
    { command: '/setname [name]', description: 'Change your display name' },
    { command: '/setnick [name]', description: 'Same as /setname' },
    { command: '/unstick', description: 'Unstick yourself if you get stuck' },
    { command: '/unstuck', description: 'Same as /unstick' },
    { command: '/leave', description: 'Leave the current building or area' }
  ];

  const emoticons = [
    { text: 'Angry', codes: ['>:(', 'X(', 'X-('] },
    { text: 'Big Eyes', codes: ['O-O', 'O.O'] },
    { text: 'Cool', codes: [':cool:', 'B)', 'B-)', '8)', '8-)', 'D)', 'D-)'] },
    { text: 'Cross Eyes', codes: ['X)', 'XD', 'X-)', 'X-D', 'X-X', 'X_X', 'X.X'] },
    { text: 'Heart', codes: ['<3'] },
    { text: 'Idea', codes: ['(i)'] },
    { text: 'Kiss', codes: [':*', ':-*'] },
    { text: 'Phone', codes: ['(:'])
    { text: 'Sad', codes: [':(', ':-('] },
    { text: 'Sleep', codes: ['ZZ', 'ZZZ', 'Z/', 'Z_Z'] },
    { text: 'Smile', codes: [':)', ':-)', ':D', ':-D'] },
    { text: 'Sorry', codes: ['?(', '?-('] },
    { text: 'Tears', codes: [':_(', ':\\'('] },
    { text: 'Tongue', codes: [':P', ':-P'] },
    { text: 'Neutral', codes: [':|', ':-|'] },
    { text: 'Wink', codes: [';)', ';-)'] }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
            {player.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{player.username}</h3>
            <p className="text-gray-400">Level {Math.floor(player.kills / 10) + 1}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <div className="text-lg font-bold text-green-400">{player.health}</div>
            <div className="text-sm text-gray-400">Health</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-lg font-bold text-blue-400">{player.ammo}</div>
            <div className="text-sm text-gray-400">Ammo</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-lg font-bold text-yellow-400">{player.currency}</div>
            <div className="text-sm text-gray-400">Currency</div>
          </div>
          <div className="bg-gray-700 rounded p-4">
            <div className="text-lg font-bold text-purple-400">{player.weapon}</div>
            <div className="text-sm text-gray-400">Weapon</div>
          </div>
        </div>
      </div>

      {player.gangId && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="font-bold mb-4">Gang Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Gang ID:</span>
              <span className="text-blue-400">{player.gangId}</span>
            </div>
            <div className="flex justify-between">
              <span>Rank:</span>
              <span className="text-green-400">{player.gangRank}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Combat Statistics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{player.kills}</div>
            <div className="text-sm text-gray-400">Kills</div>
          </div>
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{player.deaths}</div>
            <div className="text-sm text-gray-400">Deaths</div>
          </div>
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills}
            </div>
            <div className="text-sm text-gray-400">K/D Ratio</div>
          </div>
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{Math.floor(player.kills / 10) + 1}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Progress</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>XP Progress</span>
              <span>{player.kills * 10} / {(Math.floor(player.kills / 10) + 1) * 100}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${((player.kills * 10) % 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Game Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Sound Effects</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>Background Music</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>Chat Notifications</span>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <span>Show FPS</span>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Display Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Graphics Quality</label>
            <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">UI Scale</label>
            <input type="range" min="50" max="150" defaultValue="100" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Player Commands</h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {playerCommands.map((cmd, index) => (
            <div key={index} className="bg-gray-700 rounded p-3">
              <div className="font-mono text-blue-400 text-sm">{cmd.command}</div>
              <div className="text-sm text-gray-300">{cmd.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Emoticons</h4>
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {emoticons.map((emote, index) => (
            <div key={index} className="bg-gray-700 rounded p-2">
              <div className="font-medium text-sm">{emote.text}</div>
              <div className="text-xs text-gray-400">{emote.codes.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="font-bold mb-4">Controls</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Move:</span>
              <span className="text-blue-400">WASD / Arrow Keys</span>
            </div>
            <div className="flex justify-between">
              <span>Shoot:</span>
              <span className="text-blue-400">Left Click</span>
            </div>
            <div className="flex justify-between">
              <span>Reload:</span>
              <span className="text-blue-400">R</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Chat:</span>
              <span className="text-blue-400">Enter</span>
            </div>
            <div className="flex justify-between">
              <span>Menu:</span>
              <span className="text-blue-400">Escape</span>
            </div>
            <div className="flex justify-between">
              <span>Switch Weapon:</span>
              <span className="text-blue-400">1-9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Player Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'help' && renderHelpTab()}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          Press ESC to close this menu anytime
        </div>
      </div>
    </div>
  );
}