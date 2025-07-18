import { useState, useEffect } from 'react';
import { AdminRoleType, GameFile } from '../types/game';
import { hasPermission } from '../lib/adminRoles';

interface GameFileBrowserProps {
  onClose: () => void;
  userRole: AdminRoleType;
}

export default function GameFileBrowser({ onClose, userRole }: GameFileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<GameFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GameFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock file system structure
    const mockFiles: GameFile[] = [
      {
        id: '1',
        name: 'config.json',
        path: '/config/config.json',
        content: JSON.stringify({
          server: {
            port: 5000,
            maxPlayers: 100,
            gameMode: 'deathmatch'
          },
          gameplay: {
            respawnTime: 5000,
            maxHealth: 100,
            weaponSpread: 0.1
          }
        }, null, 2),
        type: 'config',
        permissions: { read: true, write: hasPermission(userRole, 'server_config') },
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'player_controller.js',
        path: '/scripts/player_controller.js',
        content: `// Player movement and input handling
class PlayerController {
  constructor(player) {
    this.player = player;
    this.speed = 5;
    this.jumpForce = 10;
  }

  update(deltaTime) {
    // Handle player movement
    if (this.input.left) {
      this.player.velocity.x = -this.speed;
    }
    if (this.input.right) {
      this.player.velocity.x = this.speed;
    }
    if (this.input.jump && this.player.grounded) {
      this.player.velocity.y = this.jumpForce;
    }
  }

  handleInput(input) {
    this.input = input;
  }
}

module.exports = PlayerController;`,
        type: 'script',
        permissions: { read: true, write: hasPermission(userRole, 'script_edit') },
        createdBy: 'scripting_team',
        updatedBy: 'scripting_team',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'urban_map.json',
        path: '/maps/urban_map.json',
        content: JSON.stringify({
          name: 'Urban Streets',
          width: 2000,
          height: 1500,
          tiles: [
            { id: '1', type: 'floor', texture: '/textures/asphalt.png', position: { x: 0, y: 0 } },
            { id: '2', type: 'wall', texture: '/textures/brick.png', position: { x: 100, y: 0 } }
          ],
          spawnPoints: [
            { x: 50, y: 50 },
            { x: 150, y: 50 }
          ]
        }, null, 2),
        type: 'map',
        permissions: { read: true, write: hasPermission(userRole, 'map_edit') },
        createdBy: 'map_editor',
        updatedBy: 'map_editor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'weapon_sounds.js',
        path: '/assets/sounds/weapon_sounds.js',
        content: `// Weapon sound configuration
const weaponSounds = {
  pistol: {
    fire: '/sounds/pistol_fire.wav',
    reload: '/sounds/pistol_reload.wav',
    empty: '/sounds/weapon_empty.wav'
  },
  rifle: {
    fire: '/sounds/rifle_fire.wav',
    reload: '/sounds/rifle_reload.wav',
    empty: '/sounds/weapon_empty.wav'
  },
  shotgun: {
    fire: '/sounds/shotgun_fire.wav',
    reload: '/sounds/shotgun_reload.wav',
    empty: '/sounds/weapon_empty.wav'
  }
};

module.exports = weaponSounds;`,
        type: 'asset',
        permissions: { read: true, write: hasPermission(userRole, 'asset_manage') },
        createdBy: 'sfx_team',
        updatedBy: 'sfx_team',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setFiles(mockFiles);
  }, [userRole]);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (file: GameFile) => {
    setSelectedFile(file);
    setFileContent(file.content);
    setIsEditing(false);
  };

  const handleSaveFile = () => {
    if (selectedFile && hasPermission(userRole, 'file_browser')) {
      // Here you would save the file to the server
      console.log('Saving file:', selectedFile.name, fileContent);
      alert(`File ${selectedFile.name} saved successfully!`);
      setIsEditing(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'script': return '📄';
      case 'config': return '⚙️';
      case 'map': return '🗺️';
      case 'asset': return '🎵';
      default: return '📁';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-6xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Game File Browser</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[70vh] gap-4">
          {/* File List */}
          <div className="w-1/3 bg-gray-800 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div className="overflow-y-auto h-full">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
                    selectedFile?.id === file.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-400">{file.path}</div>
                      <div className="text-xs text-gray-500">
                        {file.type} • {file.updatedBy}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Editor */}
          <div className="flex-1 bg-gray-800 rounded overflow-hidden">
            {selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-400">{selectedFile.path}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedFile.permissions.write && (
                        <>
                          {isEditing ? (
                            <button
                              onClick={handleSaveFile}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {isEditing ? (
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
                      placeholder="Edit file content..."
                    />
                  ) : (
                    <div className="h-full overflow-y-auto">
                      <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">
                        {selectedFile.content}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📁</div>
                  <div>Select a file to view its contents</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Permissions Info */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-400">
              <strong>Permissions:</strong> 
              {selectedFile.permissions.read && ' Read'}
              {selectedFile.permissions.write && ' Write'}
              {!selectedFile.permissions.read && !selectedFile.permissions.write && ' No Access'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}