import { useState, useEffect } from 'react';
import { AdminRoleType, GameFile } from '../types/game';
import { hasPermission } from '../lib/adminRoles';

interface GameFileBrowserProps {
  onClose: () => void;
  userRole: AdminRoleType;
}

interface FileUploadRequest {
  file: File;
  targetFolder: string;
  description?: string;
}

export default function GameFileBrowser({ onClose, userRole }: GameFileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<GameFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GameFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');

  // Define folder structure with permissions
  const folderStructure = {
    '/': { name: 'Root', permissions: ['owner', 'management'] },
    '/maps': { name: 'Maps', permissions: ['owner', 'management', 'graphics_lead', 'graphics_dev'] },
    '/scripts': { name: 'Scripts', permissions: ['owner', 'management', 'scripting_lead', 'scripting_dev'] },
    '/config': { name: 'Configuration', permissions: ['owner', 'management'] },
    '/assets': { name: 'Assets', permissions: ['owner', 'management', 'graphics_lead', 'graphics_dev'] },
    '/assets/textures': { name: 'Textures', permissions: ['owner', 'management', 'graphics_lead', 'graphics_dev'] },
    '/assets/models': { name: '3D Models', permissions: ['owner', 'management', 'graphics_lead', 'graphics_dev'] },
    '/assets/sounds': { name: 'Sound Effects', permissions: ['owner', 'management', 'sfx_lead', 'sfx_dev'] },
    '/assets/music': { name: 'Music', permissions: ['owner', 'management', 'sfx_lead', 'sfx_dev'] },
    '/weapons': { name: 'Weapons', permissions: ['owner', 'management', 'weapons_lead', 'weapons_dev'] },
    '/npcs': { name: 'NPCs', permissions: ['owner', 'management', 'scripting_lead', 'scripting_dev'] },
    '/admin': { name: 'Admin Tools', permissions: ['owner', 'management'] },
    '/logs': { name: 'Server Logs', permissions: ['owner', 'management', 'support_lead'] },
    '/backups': { name: 'Backups', permissions: ['owner', 'management'] },
    '/translations': { name: 'Translations', permissions: ['owner', 'management', 'support_lead', 'support_staff'] },
    '/documentation': { name: 'Documentation', permissions: ['owner', 'management', 'support_lead', 'support_staff'] }
  };

  useEffect(() => {
    loadFiles();
  }, [currentPath, userRole]);

  const loadFiles = () => {
    // Mock file system with organized structure
    const mockFiles: GameFile[] = [
      // Maps
      {
        id: 'map1',
        name: 'urban_streets.json',
        path: '/maps/urban_streets.json',
        content: JSON.stringify({
          id: 'urban_streets',
          name: 'Urban Streets',
          width: 2000,
          height: 2000,
          tiles: [],
          spawnPoints: [{ x: 100, y: 100 }, { x: 200, y: 200 }],
          npcs: []
        }, null, 2),
        type: 'map',
        permissions: { read: true, write: hasPermission(userRole, 'map_edit') },
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Scripts
      {
        id: 'script1',
        name: 'player_controller.js',
        path: '/scripts/player_controller.js',
        content: `// Player movement and input handling
class PlayerController {
  constructor(player) {
    this.player = player;
    this.speed = 5;
    this.keys = {};
  }

  update() {
    if (this.keys['w']) this.player.position.y -= this.speed;
    if (this.keys['s']) this.player.position.y += this.speed;
    if (this.keys['a']) this.player.position.x -= this.speed;
    if (this.keys['d']) this.player.position.x += this.speed;
  }

  onKeyDown(key) {
    this.keys[key] = true;
  }

  onKeyUp(key) {
    this.keys[key] = false;
  }
}

module.exports = PlayerController;`,
        type: 'script',
        permissions: { read: true, write: hasPermission(userRole, 'script_create') },
        createdBy: 'dev_team',
        updatedBy: 'dev_team',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Config files
      {
        id: 'config1',
        name: 'server_config.json',
        path: '/config/server_config.json',
        content: JSON.stringify({
          server: {
            port: 5000,
            maxPlayers: 100,
            tickRate: 60,
            gameMode: 'urban_mmo'
          },
          gameplay: {
            respawnTime: 5000,
            maxHealth: 100,
            weaponSpread: 0.1,
            movementSpeed: 5
          },
          security: {
            rateLimiting: true,
            maxConnections: 10,
            adminCommands: true
          }
        }, null, 2),
        type: 'config',
        permissions: { read: true, write: hasPermission(userRole, 'server_config') },
        createdBy: 'system',
        updatedBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Weapons
      {
        id: 'weapon1',
        name: 'weapons_config.json',
        path: '/weapons/weapons_config.json',
        content: JSON.stringify({
          pistol: {
            damage: 25,
            fireRate: 500,
            range: 300,
            ammoType: 'pistol_ammo',
            sound: '/sounds/pistol_fire.wav',
            reloadTime: 2000
          },
          rifle: {
            damage: 40,
            fireRate: 150,
            range: 500,
            ammoType: 'rifle_ammo',
            sound: '/sounds/rifle_fire.wav',
            reloadTime: 3000
          }
        }, null, 2),
        type: 'config',
        permissions: { read: true, write: hasPermission(userRole, 'weapon_edit') },
        createdBy: 'weapons_team',
        updatedBy: 'weapons_team',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Admin commands
      {
        id: 'admin1',
        name: 'admin_commands.js',
        path: '/admin/admin_commands.js',
        content: `// Admin commands implementation
const adminCommands = {
  // Player management
  kick: (playerId, reason = '') => {
    console.log(\`Kicking player \${playerId}: \${reason}\`);
    // Implementation here
  },
  
  ban: (playerId, duration = 0, reason = '') => {
    console.log(\`Banning player \${playerId} for \${duration}ms: \${reason}\`);
    // Implementation here
  },
  
  heal: (playerId) => {
    console.log(\`Healing player \${playerId}\`);
    // Implementation here
  },
  
  teleport: (playerId, x, y) => {
    console.log(\`Teleporting player \${playerId} to \${x}, \${y}\`);
    // Implementation here
  },
  
  // Server management
  servermessage: (message) => {
    console.log(\`Server message: \${message}\`);
    // Implementation here
  },
  
  reloadmap: () => {
    console.log('Reloading current map');
    // Implementation here
  },
  
  // Economy
  addcoins: (playerId, amount) => {
    console.log(\`Adding \${amount} coins to player \${playerId}\`);
    // Implementation here
  },
  
  // Items
  additem: (playerId, itemId) => {
    console.log(\`Adding item \${itemId} to player \${playerId}\`);
    // Implementation here
  },
  
  removeitem: (playerId, itemId) => {
    console.log(\`Removing item \${itemId} from player \${playerId}\`);
    // Implementation here
  }
};

module.exports = adminCommands;`,
        type: 'script',
        permissions: { read: hasPermission(userRole, 'admin_commands'), write: hasPermission(userRole, 'admin_commands') },
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filter files by current path and user permissions
    const filteredFiles = mockFiles.filter(file => {
      const filePath = file.path.substring(0, file.path.lastIndexOf('/')) || '/';
      const hasAccess = canAccessFolder(filePath);
      return filePath === currentPath && hasAccess;
    });

    setFiles(filteredFiles);
  };

  const canAccessFolder = (folderPath: string): boolean => {
    const folder = folderStructure[folderPath as keyof typeof folderStructure];
    if (!folder) return false;
    return folder.permissions.includes(userRole) || userRole === 'owner';
  };

  const canUploadToFolder = (folderPath: string): boolean => {
    return canAccessFolder(folderPath) && hasPermission(userRole, 'file_upload');
  };

  const getAvailableFolders = () => {
    return Object.entries(folderStructure)
      .filter(([path]) => canAccessFolder(path))
      .map(([path, info]) => ({ path, name: info.name }));
  };

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
    if (selectedFile && selectedFile.permissions.write) {
      console.log('Saving file:', selectedFile.name, fileContent);
      alert(`File ${selectedFile.name} saved successfully!`);
      setIsEditing(false);
    } else {
      alert('You do not have permission to edit this file');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedFolder) return;

    if (!canUploadToFolder(selectedFolder)) {
      alert('You do not have permission to upload to this folder');
      return;
    }

    // In a real implementation, this would upload to the server
    console.log('Uploading file:', uploadFile.name, 'to', selectedFolder);
    
    const newFile: GameFile = {
      id: Date.now().toString(),
      name: uploadFile.name,
      path: `${selectedFolder}/${uploadFile.name}`,
      content: await uploadFile.text(),
      type: 'asset',
      permissions: { read: true, write: hasPermission(userRole, 'file_edit') },
      createdBy: userRole,
      updatedBy: userRole,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setFiles(prev => [...prev, newFile]);
    setShowUpload(false);
    setUploadFile(null);
    setSelectedFolder('');
    setUploadDescription('');
    alert('File uploaded successfully!');
  };

  const navigateToFolder = (folderPath: string) => {
    if (canAccessFolder(folderPath)) {
      setCurrentPath(folderPath);
    }
  };

  const getCurrentFolderName = () => {
    const folder = folderStructure[currentPath as keyof typeof folderStructure];
    return folder ? folder.name : 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-6xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Game File Browser</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="flex gap-6 h-[75vh]">
          {/* Sidebar - Folder Navigation */}
          <div className="w-64 bg-gray-800 rounded p-4 overflow-y-auto">
            <h3 className="font-bold mb-3">Folders</h3>
            <div className="space-y-1">
              {getAvailableFolders().map(({ path, name }) => (
                <button
                  key={path}
                  onClick={() => navigateToFolder(path)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    currentPath === path
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  📁 {name}
                </button>
              ))}
            </div>

            {/* Upload Section */}
            {hasPermission(userRole, 'file_upload') && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  📤 Upload File
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex gap-4">
            {/* File List */}
            <div className="w-1/3 bg-gray-800 rounded p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Files in {getCurrentFolderName()}</h3>
                <span className="text-sm text-gray-400">{filteredFiles.length} files</span>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm mb-4"
              />

              {/* File List */}
              <div className="space-y-2 overflow-y-auto max-h-[50vh]">
                {filteredFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`p-3 rounded cursor-pointer border ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {file.type === 'script' ? '📜' : 
                         file.type === 'map' ? '🗺️' : 
                         file.type === 'config' ? '⚙️' : '📄'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-400">
                          {file.permissions.write ? '✏️' : '👀'} {file.type}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Content */}
            <div className="flex-1 bg-gray-800 rounded p-4">
              {selectedFile ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{selectedFile.name}</h3>
                    <div className="flex gap-2">
                      {selectedFile.permissions.write && (
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          {isEditing ? 'View' : 'Edit'}
                        </button>
                      )}
                      {isEditing && (
                        <button
                          onClick={handleSaveFile}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="mb-4 p-3 bg-gray-700 rounded text-sm">
                    <div><strong>Type:</strong> {selectedFile.type}</div>
                    <div><strong>Created by:</strong> {selectedFile.createdBy}</div>
                    <div><strong>Updated by:</strong> {selectedFile.updatedBy}</div>
                    <div><strong>Permissions:</strong> {selectedFile.permissions.read ? 'Read ' : ''}{selectedFile.permissions.write ? 'Write' : ''}</div>
                  </div>

                  {/* File Content */}
                  <div className="flex-1 overflow-hidden">
                    {isEditing ? (
                      <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full h-full p-3 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono resize-none"
                        placeholder="Enter file content..."
                      />
                    ) : (
                      <pre className="w-full h-full p-3 bg-gray-700 rounded text-white text-sm font-mono overflow-auto">
                        {fileContent}
                      </pre>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Select a file to view its content
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Upload File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Folder</label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="">Choose a folder...</option>
                    {getAvailableFolders()
                      .filter(({ path }) => canUploadToFolder(path))
                      .map(({ path, name }) => (
                        <option key={path} value={path}>{name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">File</label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Brief description of the file..."
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || !selectedFolder}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}