import React, { useState } from 'react';
import { Player } from '../types/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { User, Shield, Target, Zap, Heart, Coins, Settings, Ban, AlertTriangle } from 'lucide-react';
import Player2D from './Player2D';

interface PlayerProfileProps {
  player: Player;
  onClose: () => void;
  onUpdatePlayer: (updates: Partial<Player>) => void;
  currentUserRole: 'PLAYER' | 'DEV' | 'TEAM_LEAD' | 'MANAGEMENT' | 'OWNER';
}

interface PlayerStats {
  kills: number;
  deaths: number;
  score: number;
  accuracy: number;
  timeOnline: number;
  gamesPlayed: number;
  highestKillStreak: number;
  favoriteWeapon: string;
}

interface PlayerInventory {
  money: number;
  weapons: string[];
  items: string[];
  accessories: string[];
}

const mockStats: PlayerStats = {
  kills: 42,
  deaths: 18,
  score: 2340,
  accuracy: 73.5,
  timeOnline: 12.5,
  gamesPlayed: 156,
  highestKillStreak: 7,
  favoriteWeapon: 'AK-47'
};

const mockInventory: PlayerInventory = {
  money: 2500,
  weapons: ['pistol', 'ak47', 'shotgun'],
  items: ['health_pack', 'armor_vest', 'speed_boost'],
  accessories: ['baseball_cap', 'sunglasses', 'gloves']
};

export default function PlayerProfile({ player, onClose, onUpdatePlayer, currentUserRole }: PlayerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState<Partial<Player>>(player);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const canModerate = ['TEAM_LEAD', 'MANAGEMENT', 'OWNER'].includes(currentUserRole);
  const canEdit = ['MANAGEMENT', 'OWNER'].includes(currentUserRole);
  const canBan = ['TEAM_LEAD', 'MANAGEMENT', 'OWNER'].includes(currentUserRole);

  const handleSave = () => {
    onUpdatePlayer(editedPlayer);
    setIsEditing(false);
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    // In a real implementation, this would send the action to the server
    switch (action) {
      case 'kick':
        console.log('Kicking player:', player.username);
        break;
      case 'ban':
        console.log('Banning player:', player.username);
        break;
      case 'mute':
        console.log('Muting player:', player.username);
        break;
      case 'teleport':
        console.log('Teleporting to player:', player.username);
        break;
      case 'spectate':
        console.log('Spectating player:', player.username);
        break;
      case 'heal':
        onUpdatePlayer({ health: player.maxHealth });
        break;
      case 'giveMoney':
        // This would open a dialog to specify amount
        console.log('Giving money to player:', player.username);
        break;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-red-600';
      case 'MANAGEMENT': return 'bg-purple-600';
      case 'TEAM_LEAD': return 'bg-blue-600';
      case 'DEV': return 'bg-green-600';
      case 'PLAYER': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (isAlive: boolean) => {
    return isAlive ? 'bg-green-600' : 'bg-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Player2D 
                player={player} 
                scale={2} 
                showHealthBar={false} 
                showUsername={false} 
              />
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <User className="w-6 h-6" />
                  {player.username}
                  <Badge className={getRoleColor(player.role || 'PLAYER')}>
                    {player.role || 'PLAYER'}
                  </Badge>
                  <Badge className={getStatusColor(player.isAlive)}>
                    {player.isAlive ? 'Online' : 'Dead'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Player ID: {player.id} • Gang: {player.gangId || 'None'}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'destructive' : 'outline'}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
              {isEditing && (
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="customization">Appearance</TabsTrigger>
              {canModerate && <TabsTrigger value="moderation">Moderation</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    Health & Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-400">Health</div>
                      <div className="text-lg font-bold text-white">
                        {player.health}/{player.maxHealth}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-200"
                          style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-400">Position</div>
                      <div className="text-lg font-bold text-white">
                        ({Math.round(player.position.x)}, {Math.round(player.position.y)})
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Combat Info
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-400">Current Weapon</div>
                      <div className="text-lg font-bold text-white">
                        {player.currentWeapon || 'Unarmed'}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <div className="text-sm text-gray-400">Ammo</div>
                      <div className="text-lg font-bold text-white">
                        {player.ammo || 0}/30
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-green-400" />
                  Economy
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Money</div>
                    <div className="text-lg font-bold text-green-400">
                      ${mockInventory.money}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Weapons</div>
                    <div className="text-lg font-bold text-white">
                      {mockInventory.weapons.length}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-sm text-gray-400">Items</div>
                    <div className="text-lg font-bold text-white">
                      {mockInventory.items.length}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">Combat</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kills</span>
                      <span className="text-white font-bold">{mockStats.kills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deaths</span>
                      <span className="text-white font-bold">{mockStats.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">K/D Ratio</span>
                      <span className="text-white font-bold">
                        {(mockStats.kills / Math.max(mockStats.deaths, 1)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Streak</span>
                      <span className="text-white font-bold">{mockStats.highestKillStreak}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Performance</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-white font-bold">{mockStats.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score</span>
                      <span className="text-white font-bold">{mockStats.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Games</span>
                      <span className="text-white font-bold">{mockStats.gamesPlayed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Favorite Weapon</span>
                      <span className="text-white font-bold">{mockStats.favoriteWeapon}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Online</span>
                      <span className="text-white font-bold">{mockStats.timeOnline}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white font-bold">
                        {player.isAlive ? 'Active' : 'Respawning'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gang</span>
                      <span className="text-white font-bold">{player.gangId || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Weapons
                  </h3>
                  <div className="space-y-2">
                    {mockInventory.weapons.map((weapon, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                        <span className="text-white capitalize">{weapon.replace('_', ' ')}</span>
                        <Badge variant="secondary">Owned</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Items & Accessories
                  </h3>
                  <div className="space-y-2">
                    {mockInventory.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                        <span className="text-white capitalize">{item.replace('_', ' ')}</span>
                        <Badge variant="outline">Item</Badge>
                      </div>
                    ))}
                    {mockInventory.accessories.map((accessory, index) => (
                      <div key={`acc-${index}`} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                        <span className="text-white capitalize">{accessory.replace('_', ' ')}</span>
                        <Badge variant="outline">Accessory</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customization" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Character Appearance</h3>
                  <div className="bg-gray-800 p-4 rounded">
                    <div className="flex justify-center mb-4">
                      <Player2D 
                        player={player} 
                        scale={3} 
                        showHealthBar={false} 
                        showUsername={false} 
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-white">Head Type</Label>
                        <Select defaultValue="default_head">
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default_head">Default</SelectItem>
                            <SelectItem value="pale_head">Pale</SelectItem>
                            <SelectItem value="tan_head">Tan</SelectItem>
                            <SelectItem value="dark_head">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Shirt</Label>
                        <Select defaultValue="basic_shirt">
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic_shirt">Basic Shirt</SelectItem>
                            <SelectItem value="hoodie">Hoodie</SelectItem>
                            <SelectItem value="tank_top">Tank Top</SelectItem>
                            <SelectItem value="suit_jacket">Suit Jacket</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Pants</Label>
                        <Select defaultValue="basic_pants">
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic_pants">Basic Pants</SelectItem>
                            <SelectItem value="jeans">Jeans</SelectItem>
                            <SelectItem value="shorts">Shorts</SelectItem>
                            <SelectItem value="suit_pants">Suit Pants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Accessories</h3>
                  <div className="bg-gray-800 p-4 rounded space-y-3">
                    <div>
                      <Label className="text-white">Hat</Label>
                      <Select defaultValue="none">
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="baseball_cap">Baseball Cap</SelectItem>
                          <SelectItem value="beanie">Beanie</SelectItem>
                          <SelectItem value="fedora">Fedora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Eyewear</Label>
                      <Select defaultValue="none">
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sunglasses">Sunglasses</SelectItem>
                          <SelectItem value="glasses">Glasses</SelectItem>
                          <SelectItem value="goggles">Goggles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Gloves</Label>
                      <Select defaultValue="none">
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="basic_gloves">Basic Gloves</SelectItem>
                          <SelectItem value="leather_gloves">Leather Gloves</SelectItem>
                          <SelectItem value="tactical_gloves">Tactical Gloves</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {canModerate && (
              <TabsContent value="moderation" className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Moderation Actions</h3>
                  <Badge variant="destructive">Admin Only</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-white">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('heal')}
                        className="text-green-400 border-green-400"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Heal
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('teleport')}
                        className="text-blue-400 border-blue-400"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Teleport
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('spectate')}
                        className="text-yellow-400 border-yellow-400"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Spectate
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('giveMoney')}
                        className="text-green-400 border-green-400"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Give Money
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-white">Disciplinary Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('mute')}
                        className="text-orange-400 border-orange-400"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Mute
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleAction('kick')}
                        className="text-red-400 border-red-400"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Kick
                      </Button>
                      {canBan && (
                        <Button 
                          variant="destructive"
                          onClick={() => handleAction('ban')}
                          className="col-span-2"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Ban Player
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="text-md font-semibold text-white mb-2">Moderation History</h4>
                  <div className="text-sm text-gray-400">
                    No moderation actions recorded for this player.
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}