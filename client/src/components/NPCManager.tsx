import { useState, useEffect } from 'react';
import { AdminRoleType, NPC } from '../types/game';
import { hasPermission } from '../lib/adminRoles';

interface NPCManagerProps {
  onClose: () => void;
  userRole: AdminRoleType;
}

export default function NPCManager({ onClose, userRole }: NPCManagerProps) {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    // Mock NPCs
    const mockNPCs: NPC[] = [
      {
        id: '1',
        name: 'Gun Shop Owner',
        type: 'merchant',
        position: { x: 150, y: 200 },
        mapId: 'urban_streets',
        dialogue: {
          greeting: 'Welcome to my gun shop! Looking for some firepower?',
          purchase: 'That\'s a fine choice! Here\'s your weapon.',
          farewell: 'Stay safe out there!'
        },
        stats: {
          health: 100,
          damage: 0,
          speed: 0,
          defense: 50
        },
        appearance: {
          sprite: 'merchant_gunshop',
          color: '#8B4513',
          size: 32
        },
        script: `// Gun shop merchant behavior
function onInteract(player) {
  if (player.currency >= 100) {
    showShop(player);
  } else {
    speak("You need at least $100 to shop here.");
  }
}

function showShop(player) {
  const weapons = ['pistol', 'rifle', 'shotgun'];
  const prices = { pistol: 100, rifle: 250, shotgun: 200 };
  
  displayShopMenu(weapons, prices);
}`,
        interactions: ['shop', 'talk', 'info']
      },
      {
        id: '2',
        name: 'Street Guard',
        type: 'guard',
        position: { x: 300, y: 100 },
        mapId: 'urban_streets',
        dialogue: {
          greeting: 'Halt! State your business.',
          warning: 'Keep the peace or face the consequences.',
          combat: 'You\'ve chosen violence!'
        },
        stats: {
          health: 150,
          damage: 40,
          speed: 3,
          defense: 80
        },
        appearance: {
          sprite: 'guard_uniform',
          color: '#000080',
          size: 32
        },
        script: `// Guard behavior
let alertLevel = 0;

function onPlayerNear(player) {
  if (player.wantedLevel > 0) {
    alertLevel++;
    if (alertLevel > 5) {
      attack(player);
    } else {
      speak("I'm watching you...");
    }
  }
}

function attack(player) {
  speak("Stop right there, criminal!");
  startCombat(player);
}`,
        interactions: ['talk', 'challenge', 'report']
      },
      {
        id: '3',
        name: 'Quest Giver',
        type: 'quest',
        position: { x: 450, y: 300 },
        mapId: 'urban_streets',
        dialogue: {
          greeting: 'I have a job for someone with your skills.',
          quest_available: 'There\'s been trouble at the docks. Can you investigate?',
          quest_complete: 'Excellent work! Here\'s your reward.',
          quest_in_progress: 'Any progress on that dock situation?'
        },
        stats: {
          health: 80,
          damage: 0,
          speed: 0,
          defense: 20
        },
        appearance: {
          sprite: 'civilian_coat',
          color: '#654321',
          size: 32
        },
        script: `// Quest giver behavior
function onInteract(player) {
  if (hasQuest(player, 'dock_investigation')) {
    if (isQuestComplete(player, 'dock_investigation')) {
      completeQuest(player, 'dock_investigation');
      giveReward(player, { currency: 500, experience: 100 });
    } else {
      speak(dialogue.quest_in_progress);
    }
  } else {
    offerQuest(player, 'dock_investigation');
  }
}`,
        interactions: ['quest', 'talk', 'info']
      },
      {
        id: '4',
        name: 'Hostile Gang Member',
        type: 'enemy',
        position: { x: 600, y: 150 },
        mapId: 'urban_streets',
        dialogue: {
          taunt: 'You picked the wrong neighborhood!',
          combat: 'Time to teach you a lesson!',
          defeat: 'You got lucky this time...'
        },
        stats: {
          health: 120,
          damage: 35,
          speed: 4,
          defense: 60
        },
        appearance: {
          sprite: 'gang_member',
          color: '#8B0000',
          size: 32
        },
        script: `// Enemy behavior
let aggroRange = 100;
let attackRange = 50;

function update(deltaTime) {
  const nearbyPlayers = findPlayersInRange(aggroRange);
  
  if (nearbyPlayers.length > 0) {
    const target = nearbyPlayers[0];
    const distance = getDistance(position, target.position);
    
    if (distance <= attackRange) {
      attack(target);
    } else {
      moveTowards(target.position, deltaTime);
    }
  } else {
    patrol(deltaTime);
  }
}

function attack(target) {
  speak(dialogue.combat);
  dealDamage(target, stats.damage);
}`,
        interactions: ['fight', 'intimidate']
      },
      {
        id: '5',
        name: 'Informant',
        type: 'neutral',
        position: { x: 200, y: 400 },
        mapId: 'urban_streets',
        dialogue: {
          greeting: 'Pssst... looking for information?',
          info: 'I know things about this city that others don\'t.',
          price: 'Information costs money. $50 for basic intel.',
          secret: 'There\'s a hidden cache in the old warehouse...'
        },
        stats: {
          health: 60,
          damage: 10,
          speed: 5,
          defense: 10
        },
        appearance: {
          sprite: 'informant_hoodie',
          color: '#2F4F4F',
          size: 32
        },
        script: `// Informant behavior
function onInteract(player) {
  if (player.currency >= 50) {
    const info = getRandomInfo();
    speak(info);
    player.currency -= 50;
    player.intel.push(info);
  } else {
    speak("Come back when you have money.");
  }
}

function getRandomInfo() {
  const infos = [
    "The police patrol changes shifts at midnight.",
    "There's a weapon cache in the abandoned building.",
    "The rival gang meets at the old factory.",
    "A new shipment arrives at the docks tomorrow."
  ];
  return infos[Math.floor(Math.random() * infos.length)];
}`,
        interactions: ['talk', 'pay', 'info']
      }
    ];

    setNpcs(mockNPCs);
  }, []);

  const filteredNPCs = npcs.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || npc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleNPCSelect = (npc: NPC) => {
    setSelectedNPC(npc);
    setIsEditing(false);
  };

  const handleCreateNPC = () => {
    if (!hasPermission(userRole, 'npc_create')) {
      alert('You don\'t have permission to create NPCs');
      return;
    }

    const newNPC: NPC = {
      id: Date.now().toString(),
      name: 'New NPC',
      type: 'neutral',
      position: { x: 100, y: 100 },
      mapId: 'urban_streets',
      dialogue: {
        greeting: 'Hello there!'
      },
      stats: {
        health: 100,
        damage: 0,
        speed: 0,
        defense: 0
      },
      appearance: {
        sprite: 'default_npc',
        color: '#FFFFFF',
        size: 32
      },
      script: '// NPC behavior script\nfunction onInteract(player) {\n  speak("Hello!");\n}',
      interactions: ['talk']
    };

    setNpcs([...npcs, newNPC]);
    setSelectedNPC(newNPC);
    setIsEditing(true);
  };

  const handleSaveNPC = () => {
    if (!selectedNPC || !hasPermission(userRole, 'npc_edit')) {
      alert('You don\'t have permission to edit NPCs');
      return;
    }

    const updatedNPCs = npcs.map(npc => npc.id === selectedNPC.id ? selectedNPC : npc);
    setNpcs(updatedNPCs);
    setIsEditing(false);
    alert(`NPC "${selectedNPC.name}" saved successfully!`);
  };

  const handleDeleteNPC = () => {
    if (!selectedNPC || !hasPermission(userRole, 'npc_edit')) {
      alert('You don\'t have permission to delete NPCs');
      return;
    }

    if (confirm(`Are you sure you want to delete "${selectedNPC.name}"?`)) {
      setNpcs(npcs.filter(npc => npc.id !== selectedNPC.id));
      setSelectedNPC(null);
    }
  };

  const updateNPCField = (field: string, value: any) => {
    if (!selectedNPC) return;
    
    const updatedNPC = { ...selectedNPC };
    const fieldParts = field.split('.');
    
    let current = updatedNPC;
    for (let i = 0; i < fieldParts.length - 1; i++) {
      current = current[fieldParts[i]];
    }
    current[fieldParts[fieldParts.length - 1]] = value;
    
    setSelectedNPC(updatedNPC);
  };

  const getNPCTypeIcon = (type: string) => {
    switch (type) {
      case 'merchant': return '🛍️';
      case 'guard': return '🛡️';
      case 'quest': return '❓';
      case 'enemy': return '⚔️';
      case 'neutral': return '👤';
      default: return '🤖';
    }
  };

  const getNPCTypeColor = (type: string) => {
    switch (type) {
      case 'merchant': return '#10B981';
      case 'guard': return '#3B82F6';
      case 'quest': return '#F59E0B';
      case 'enemy': return '#EF4444';
      case 'neutral': return '#6B7280';
      default: return '#9CA3AF';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-7xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">NPC Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[75vh] gap-4">
          {/* NPC List */}
          <div className="w-1/3 bg-gray-800 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Search NPCs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="merchant">Merchant</option>
                  <option value="guard">Guard</option>
                  <option value="quest">Quest</option>
                  <option value="enemy">Enemy</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <button
                onClick={handleCreateNPC}
                disabled={!hasPermission(userRole, 'npc_create')}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm"
              >
                Create New NPC
              </button>
            </div>
            <div className="overflow-y-auto h-full">
              {filteredNPCs.map(npc => (
                <div
                  key={npc.id}
                  onClick={() => handleNPCSelect(npc)}
                  className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
                    selectedNPC?.id === npc.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getNPCTypeIcon(npc.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{npc.name}</div>
                      <div className="text-sm" style={{ color: getNPCTypeColor(npc.type) }}>
                        {npc.type.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {npc.mapId} • ({npc.position.x}, {npc.position.y})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NPC Editor */}
          <div className="flex-1 bg-gray-800 rounded overflow-hidden">
            {selectedNPC ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{selectedNPC.name}</h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSaveNPC}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(true)}
                            disabled={!hasPermission(userRole, 'npc_edit')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={handleDeleteNPC}
                            disabled={!hasPermission(userRole, 'npc_edit')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-bold mb-3">Basic Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input
                            type="text"
                            value={selectedNPC.name}
                            onChange={(e) => updateNPCField('name', e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={selectedNPC.type}
                            onChange={(e) => updateNPCField('type', e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          >
                            <option value="merchant">Merchant</option>
                            <option value="guard">Guard</option>
                            <option value="quest">Quest</option>
                            <option value="enemy">Enemy</option>
                            <option value="neutral">Neutral</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Position X</label>
                          <input
                            type="number"
                            value={selectedNPC.position.x}
                            onChange={(e) => updateNPCField('position.x', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Position Y</label>
                          <input
                            type="number"
                            value={selectedNPC.position.y}
                            onChange={(e) => updateNPCField('position.y', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-bold mb-3">Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Health</label>
                          <input
                            type="number"
                            value={selectedNPC.stats.health}
                            onChange={(e) => updateNPCField('stats.health', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Damage</label>
                          <input
                            type="number"
                            value={selectedNPC.stats.damage}
                            onChange={(e) => updateNPCField('stats.damage', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Speed</label>
                          <input
                            type="number"
                            value={selectedNPC.stats.speed}
                            onChange={(e) => updateNPCField('stats.speed', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Defense</label>
                          <input
                            type="number"
                            value={selectedNPC.stats.defense}
                            onChange={(e) => updateNPCField('stats.defense', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-bold mb-3">Appearance</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Sprite</label>
                          <input
                            type="text"
                            value={selectedNPC.appearance.sprite}
                            onChange={(e) => updateNPCField('appearance.sprite', e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Color</label>
                          <input
                            type="color"
                            value={selectedNPC.appearance.color}
                            onChange={(e) => updateNPCField('appearance.color', e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Size</label>
                          <input
                            type="number"
                            value={selectedNPC.appearance.size}
                            onChange={(e) => updateNPCField('appearance.size', parseInt(e.target.value))}
                            disabled={!isEditing}
                            className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Script */}
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-bold mb-3">Behavior Script</h4>
                      <textarea
                        value={selectedNPC.script || ''}
                        onChange={(e) => updateNPCField('script', e.target.value)}
                        disabled={!isEditing}
                        className="w-full h-32 p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm font-mono disabled:opacity-50"
                        placeholder="JavaScript code for NPC behavior..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <div>Select an NPC to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}