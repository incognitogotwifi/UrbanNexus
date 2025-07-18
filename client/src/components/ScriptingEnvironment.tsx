import { useState, useEffect } from 'react';
import { AdminRoleType, ScriptEnvironment } from '../types/game';
import { hasPermission } from '../lib/adminRoles';

interface ScriptingEnvironmentProps {
  onClose: () => void;
  userRole: AdminRoleType;
}

export default function ScriptingEnvironment({ onClose, userRole }: ScriptingEnvironmentProps) {
  const [scripts, setScripts] = useState<ScriptEnvironment[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptEnvironment | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    // Mock script environments
    const mockScripts: ScriptEnvironment[] = [
      {
        id: '1',
        name: 'Player Movement Script',
        code: `// Player movement handler
function handlePlayerMovement(player, input, deltaTime) {
  const speed = 5;
  
  if (input.left) {
    player.position.x -= speed * deltaTime;
  }
  if (input.right) {
    player.position.x += speed * deltaTime;
  }
  if (input.up) {
    player.position.y -= speed * deltaTime;
  }
  if (input.down) {
    player.position.y += speed * deltaTime;
  }
  
  // Boundary checks
  player.position.x = Math.max(0, Math.min(1000, player.position.x));
  player.position.y = Math.max(0, Math.min(1000, player.position.y));
  
  console.log('Player position:', player.position);
  return player;
}

// Test the function
const testPlayer = { position: { x: 100, y: 100 } };
const testInput = { left: false, right: true, up: false, down: false };
const result = handlePlayerMovement(testPlayer, testInput, 0.016);
console.log('Result:', result);`,
        variables: {
          player: { position: { x: 100, y: 100 } },
          input: { left: false, right: true, up: false, down: false },
          deltaTime: 0.016
        },
        functions: {},
        imports: [],
        permissions: ['player_modify', 'script_execute']
      },
      {
        id: '2',
        name: 'NPC Behavior Script',
        code: `// NPC AI behavior
class NPCBehavior {
  constructor(npc) {
    this.npc = npc;
    this.state = 'idle';
    this.target = null;
    this.alertRadius = 100;
    this.attackRadius = 50;
  }

  update(players, deltaTime) {
    const nearestPlayer = this.findNearestPlayer(players);
    
    if (nearestPlayer) {
      const distance = this.getDistance(this.npc.position, nearestPlayer.position);
      
      if (distance <= this.attackRadius) {
        this.state = 'attacking';
        this.attack(nearestPlayer);
      } else if (distance <= this.alertRadius) {
        this.state = 'pursuing';
        this.moveTowards(nearestPlayer.position, deltaTime);
      } else {
        this.state = 'idle';
        this.patrol(deltaTime);
      }
    } else {
      this.state = 'idle';
      this.patrol(deltaTime);
    }
    
    console.log('NPC State:', this.state);
  }

  findNearestPlayer(players) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const player of players) {
      const distance = this.getDistance(this.npc.position, player.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = player;
      }
    }
    
    return nearest;
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  moveTowards(targetPos, deltaTime) {
    const dx = targetPos.x - this.npc.position.x;
    const dy = targetPos.y - this.npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.npc.position.x += (dx / distance) * this.npc.speed * deltaTime;
      this.npc.position.y += (dy / distance) * this.npc.speed * deltaTime;
    }
  }

  patrol(deltaTime) {
    // Simple patrol behavior
    if (!this.npc.patrolDirection) {
      this.npc.patrolDirection = { x: 1, y: 0 };
    }
    
    this.npc.position.x += this.npc.patrolDirection.x * this.npc.speed * 0.5 * deltaTime;
    
    // Change direction randomly
    if (Math.random() < 0.01) {
      this.npc.patrolDirection.x *= -1;
    }
  }

  attack(target) {
    console.log('NPC attacking player:', target.id);
    // Attack logic here
  }
}

// Test the NPC behavior
const testNPC = {
  position: { x: 200, y: 200 },
  speed: 3,
  patrolDirection: { x: 1, y: 0 }
};

const testPlayers = [
  { id: '1', position: { x: 180, y: 200 } },
  { id: '2', position: { x: 300, y: 300 } }
];

const npcBehavior = new NPCBehavior(testNPC);
npcBehavior.update(testPlayers, 0.016);`,
        variables: {
          npc: { position: { x: 200, y: 200 }, speed: 3 },
          players: [
            { id: '1', position: { x: 180, y: 200 } },
            { id: '2', position: { x: 300, y: 300 } }
          ]
        },
        functions: {},
        imports: [],
        permissions: ['npc_edit', 'script_execute']
      },
      {
        id: '3',
        name: 'Weapon System Script',
        code: `// Weapon system
class WeaponSystem {
  constructor() {
    this.weapons = {
      pistol: {
        damage: 25,
        fireRate: 0.5,
        range: 200,
        ammo: 12,
        reloadTime: 2.0
      },
      rifle: {
        damage: 35,
        fireRate: 0.1,
        range: 300,
        ammo: 30,
        reloadTime: 3.0
      },
      shotgun: {
        damage: 60,
        fireRate: 1.0,
        range: 100,
        ammo: 6,
        reloadTime: 2.5
      }
    };
  }

  fire(weaponType, playerPos, targetPos) {
    const weapon = this.weapons[weaponType];
    if (!weapon) return null;

    const distance = this.getDistance(playerPos, targetPos);
    if (distance > weapon.range) {
      console.log('Target out of range');
      return null;
    }

    const damage = weapon.damage;
    const spread = weaponType === 'shotgun' ? 0.2 : 0.05;
    
    console.log('Firing', weaponType, 'for', damage, 'damage');
    
    return {
      damage: damage,
      spread: spread,
      hitChance: Math.max(0.1, 1 - (distance / weapon.range))
    };
  }

  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getWeaponStats(weaponType) {
    return this.weapons[weaponType] || null;
  }
}

// Test the weapon system
const weaponSystem = new WeaponSystem();
const playerPos = { x: 100, y: 100 };
const targetPos = { x: 200, y: 150 };

const result = weaponSystem.fire('pistol', playerPos, targetPos);
console.log('Shot result:', result);

const stats = weaponSystem.getWeaponStats('rifle');
console.log('Rifle stats:', stats);`,
        variables: {
          playerPos: { x: 100, y: 100 },
          targetPos: { x: 200, y: 150 },
          weaponType: 'pistol'
        },
        functions: {},
        imports: [],
        permissions: ['weapon_edit', 'script_execute']
      }
    ];

    setScripts(mockScripts);
  }, []);

  const handleScriptSelect = (script: ScriptEnvironment) => {
    setSelectedScript(script);
    setCode(script.code);
    setOutput('');
  };

  const runScript = () => {
    if (!selectedScript || !hasPermission(userRole, 'script_execute')) {
      setOutput('Error: No permission to execute scripts');
      return;
    }

    setIsRunning(true);
    setOutput('Running script...\n');

    // Mock script execution
    setTimeout(() => {
      try {
        // In a real implementation, you would send this to a sandboxed environment
        const mockOutput = `Script "${selectedScript.name}" executed successfully!\n\nOutput:\n${
          selectedScript.name.includes('Player') ? 'Player position: {x: 105, y: 100}\nResult: {position: {x: 105, y: 100}}' :
          selectedScript.name.includes('NPC') ? 'NPC State: pursuing\nNPC attacking player: 1' :
          'Shot result: {damage: 25, spread: 0.05, hitChance: 0.82}\nRifle stats: {damage: 35, fireRate: 0.1, range: 300, ammo: 30, reloadTime: 3}'
        }`;
        
        setOutput(mockOutput);
      } catch (error) {
        setOutput(`Error: ${error}`);
      } finally {
        setIsRunning(false);
      }
    }, 1000);
  };

  const saveScript = () => {
    if (!selectedScript || !hasPermission(userRole, 'script_edit')) {
      alert('No permission to save scripts');
      return;
    }

    // Update the script
    const updatedScript = { ...selectedScript, code };
    const updatedScripts = scripts.map(s => s.id === selectedScript.id ? updatedScript : s);
    setScripts(updatedScripts);
    setSelectedScript(updatedScript);
    
    alert(`Script "${selectedScript.name}" saved successfully!`);
  };

  const createNewScript = () => {
    const newScript: ScriptEnvironment = {
      id: Date.now().toString(),
      name: 'New Script',
      code: '// New script\nconsole.log("Hello, World!");',
      variables: {},
      functions: {},
      imports: [],
      permissions: []
    };
    
    setScripts([...scripts, newScript]);
    setSelectedScript(newScript);
    setCode(newScript.code);
    setOutput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-7xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Scripting Environment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[75vh] gap-4">
          {/* Script List */}
          <div className="w-1/4 bg-gray-800 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={createNewScript}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  New Script
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-full">
              {scripts.map(script => (
                <div
                  key={script.id}
                  onClick={() => handleScriptSelect(script)}
                  className={`p-3 cursor-pointer border-b border-gray-700 hover:bg-gray-700 ${
                    selectedScript?.id === script.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="font-medium">{script.name}</div>
                  <div className="text-sm text-gray-400">
                    {script.permissions.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 bg-gray-800 rounded overflow-hidden">
            {selectedScript ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">{selectedScript.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={saveScript}
                        disabled={!hasPermission(userRole, 'script_edit')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={runScript}
                        disabled={isRunning || !hasPermission(userRole, 'script_execute')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm"
                      >
                        {isRunning ? 'Running...' : 'Run'}
                      </button>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={testMode}
                          onChange={(e) => setTestMode(e.target.checked)}
                          className="rounded"
                        />
                        Test Mode
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none border-none outline-none"
                    placeholder="Write your script here..."
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <div>Select a script to edit</div>
                </div>
              </div>
            )}
          </div>

          {/* Output Console */}
          <div className="w-1/3 bg-gray-800 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold">Console Output</h3>
            </div>
            <div className="h-full overflow-y-auto p-4">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                {output || 'No output yet. Run a script to see results.'}
              </pre>
            </div>
          </div>
        </div>

        {/* Script Variables */}
        {selectedScript && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <h4 className="font-bold mb-2">Script Variables</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(selectedScript.variables).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-blue-400">{key}:</span>
                  <span className="text-gray-300">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}