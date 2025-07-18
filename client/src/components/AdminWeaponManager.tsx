import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Zap, 
  Target, 
  Timer, 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Edit,
  Eye,
  EyeOff 
} from 'lucide-react';

interface WeaponStats {
  id: string;
  name: string;
  type: 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'smg' | 'melee';
  damage: number;
  range: number;
  fireRate: number;
  accuracy: number;
  magazineSize: number;
  reloadTime: number;
  price: number;
  description: string;
  enabled: boolean;
}

interface AdminWeaponManagerProps {
  onClose: () => void;
}

const defaultWeapons: WeaponStats[] = [
  {
    id: 'pistol',
    name: 'Pistol',
    type: 'pistol',
    damage: 35,
    range: 100,
    fireRate: 500,
    accuracy: 80,
    magazineSize: 15,
    reloadTime: 2000,
    price: 500,
    description: 'Standard sidearm with good accuracy',
    enabled: true
  },
  {
    id: 'ak47',
    name: 'AK-47',
    type: 'rifle',
    damage: 45,
    range: 150,
    fireRate: 600,
    accuracy: 70,
    magazineSize: 30,
    reloadTime: 3000,
    price: 1500,
    description: 'Reliable assault rifle with high damage',
    enabled: true
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    type: 'shotgun',
    damage: 80,
    range: 50,
    fireRate: 800,
    accuracy: 60,
    magazineSize: 8,
    reloadTime: 4000,
    price: 800,
    description: 'High damage at close range',
    enabled: true
  },
  {
    id: 'sniper',
    name: 'Sniper Rifle',
    type: 'sniper',
    damage: 120,
    range: 300,
    fireRate: 1500,
    accuracy: 95,
    magazineSize: 5,
    reloadTime: 3500,
    price: 2000,
    description: 'High damage, long range precision weapon',
    enabled: true
  },
  {
    id: 'smg',
    name: 'SMG',
    type: 'smg',
    damage: 25,
    range: 80,
    fireRate: 100,
    accuracy: 65,
    magazineSize: 40,
    reloadTime: 2500,
    price: 900,
    description: 'High rate of fire submachine gun',
    enabled: true
  }
];

export default function AdminWeaponManager({ onClose }: AdminWeaponManagerProps) {
  const [weapons, setWeapons] = useState<WeaponStats[]>(defaultWeapons);
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedWeapon, setEditedWeapon] = useState<WeaponStats | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleWeaponSelect = (weapon: WeaponStats) => {
    setSelectedWeapon(weapon);
    setEditedWeapon({ ...weapon });
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (selectedWeapon) {
      setEditedWeapon({ ...selectedWeapon });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editedWeapon) {
      if (isCreating) {
        // Add new weapon
        setWeapons([...weapons, editedWeapon]);
        setIsCreating(false);
      } else {
        // Update existing weapon
        setWeapons(weapons.map(w => w.id === editedWeapon.id ? editedWeapon : w));
      }
      setSelectedWeapon(editedWeapon);
      setIsEditing(false);
      setHasChanges(true);
      
      // In real implementation, send to server
      try {
        await fetch('/api/admin/weapons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedWeapon)
        });
      } catch (error) {
        console.error('Failed to save weapon:', error);
      }
    }
  };

  const handleDelete = (weaponId: string) => {
    if (confirm('Are you sure you want to delete this weapon?')) {
      setWeapons(weapons.filter(w => w.id !== weaponId));
      if (selectedWeapon?.id === weaponId) {
        setSelectedWeapon(null);
      }
      setHasChanges(true);
    }
  };

  const handleToggleEnabled = (weaponId: string) => {
    setWeapons(weapons.map(w => 
      w.id === weaponId ? { ...w, enabled: !w.enabled } : w
    ));
    if (selectedWeapon?.id === weaponId) {
      setSelectedWeapon({ ...selectedWeapon, enabled: !selectedWeapon.enabled });
    }
    setHasChanges(true);
  };

  const handleCreateNew = () => {
    const newWeapon: WeaponStats = {
      id: `weapon_${Date.now()}`,
      name: 'New Weapon',
      type: 'pistol',
      damage: 50,
      range: 100,
      fireRate: 500,
      accuracy: 75,
      magazineSize: 15,
      reloadTime: 2000,
      price: 1000,
      description: 'New weapon description',
      enabled: true
    };
    setEditedWeapon(newWeapon);
    setSelectedWeapon(newWeapon);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditedWeapon(selectedWeapon);
  };

  const getWeaponTypeColor = (type: string) => {
    switch (type) {
      case 'pistol': return 'bg-blue-600';
      case 'rifle': return 'bg-green-600';
      case 'shotgun': return 'bg-red-600';
      case 'sniper': return 'bg-purple-600';
      case 'smg': return 'bg-yellow-600';
      case 'melee': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getDamageColor = (damage: number) => {
    if (damage >= 100) return 'text-red-400';
    if (damage >= 60) return 'text-orange-400';
    if (damage >= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Weapon Manager
              </CardTitle>
              <CardDescription className="text-gray-300">
                Manage weapon stats, balance, and availability
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateNew}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Weapon
              </Button>
              {hasChanges && (
                <Button 
                  onClick={() => setHasChanges(false)}
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save All
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weapons List */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">Weapons</h3>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {weapons.map((weapon) => (
                  <div
                    key={weapon.id}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selectedWeapon?.id === weapon.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => handleWeaponSelect(weapon)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{weapon.name}</span>
                          <Badge className={getWeaponTypeColor(weapon.type)}>
                            {weapon.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          ${weapon.price} • {weapon.damage} DMG
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEnabled(weapon.id);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          {weapon.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(weapon.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weapon Details */}
            <div className="lg:col-span-2">
              {selectedWeapon ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Weapon Details</h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button 
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            onClick={handleCancel}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={handleEdit}
                          variant="outline"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="stats">Statistics</TabsTrigger>
                      <TabsTrigger value="balance">Balance</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stats" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Weapon Name</Label>
                            {isEditing ? (
                              <Input
                                value={editedWeapon?.name || ''}
                                onChange={(e) => setEditedWeapon(prev => 
                                  prev ? { ...prev, name: e.target.value } : null
                                )}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            ) : (
                              <div className="text-lg font-bold text-white">{selectedWeapon.name}</div>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-white">Type</Label>
                            {isEditing ? (
                              <Select 
                                value={editedWeapon?.type || 'pistol'}
                                onValueChange={(value) => setEditedWeapon(prev => 
                                  prev ? { ...prev, type: value as any } : null
                                )}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pistol">Pistol</SelectItem>
                                  <SelectItem value="rifle">Rifle</SelectItem>
                                  <SelectItem value="shotgun">Shotgun</SelectItem>
                                  <SelectItem value="sniper">Sniper</SelectItem>
                                  <SelectItem value="smg">SMG</SelectItem>
                                  <SelectItem value="melee">Melee</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={getWeaponTypeColor(selectedWeapon.type)}>
                                {selectedWeapon.type}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-white">Description</Label>
                            {isEditing ? (
                              <Input
                                value={editedWeapon?.description || ''}
                                onChange={(e) => setEditedWeapon(prev => 
                                  prev ? { ...prev, description: e.target.value } : null
                                )}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            ) : (
                              <div className="text-gray-300">{selectedWeapon.description}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white">Damage</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editedWeapon?.damage || 0}
                                onChange={(e) => setEditedWeapon(prev => 
                                  prev ? { ...prev, damage: parseInt(e.target.value) } : null
                                )}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            ) : (
                              <div className={`text-lg font-bold ${getDamageColor(selectedWeapon.damage)}`}>
                                {selectedWeapon.damage}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-white">Range</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editedWeapon?.range || 0}
                                onChange={(e) => setEditedWeapon(prev => 
                                  prev ? { ...prev, range: parseInt(e.target.value) } : null
                                )}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            ) : (
                              <div className="text-lg font-bold text-white">{selectedWeapon.range}</div>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-white">Fire Rate (ms)</Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editedWeapon?.fireRate || 0}
                                onChange={(e) => setEditedWeapon(prev => 
                                  prev ? { ...prev, fireRate: parseInt(e.target.value) } : null
                                )}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            ) : (
                              <div className="text-lg font-bold text-white">{selectedWeapon.fireRate}ms</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white">Accuracy (%)</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedWeapon?.accuracy || 0}
                              onChange={(e) => setEditedWeapon(prev => 
                                prev ? { ...prev, accuracy: parseInt(e.target.value) } : null
                              )}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          ) : (
                            <div className="text-lg font-bold text-white">{selectedWeapon.accuracy}%</div>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white">Magazine Size</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedWeapon?.magazineSize || 0}
                              onChange={(e) => setEditedWeapon(prev => 
                                prev ? { ...prev, magazineSize: parseInt(e.target.value) } : null
                              )}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          ) : (
                            <div className="text-lg font-bold text-white">{selectedWeapon.magazineSize}</div>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-white">Reload Time (ms)</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedWeapon?.reloadTime || 0}
                              onChange={(e) => setEditedWeapon(prev => 
                                prev ? { ...prev, reloadTime: parseInt(e.target.value) } : null
                              )}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          ) : (
                            <div className="text-lg font-bold text-white">{selectedWeapon.reloadTime}ms</div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="balance" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white">Damage Analysis</h4>
                          <div className="bg-gray-800 p-4 rounded">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">DPS</span>
                                <span className="text-white font-bold">
                                  {Math.round((selectedWeapon.damage / (selectedWeapon.fireRate / 1000)) * 10) / 10}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Damage per Magazine</span>
                                <span className="text-white font-bold">
                                  {selectedWeapon.damage * selectedWeapon.magazineSize}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Effective Range</span>
                                <span className="text-white font-bold">
                                  {Math.round(selectedWeapon.range * (selectedWeapon.accuracy / 100))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-white">Balance Rating</h4>
                          <div className="bg-gray-800 p-4 rounded">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Overall Power</span>
                                <span className="text-white font-bold">
                                  {Math.round((selectedWeapon.damage * selectedWeapon.accuracy) / 50)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Versatility</span>
                                <span className="text-white font-bold">
                                  {Math.round((selectedWeapon.range + selectedWeapon.accuracy) / 4)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Cost Effectiveness</span>
                                <span className="text-white font-bold">
                                  {Math.round((selectedWeapon.damage * 100) / selectedWeapon.price)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Price ($)</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedWeapon?.price || 0}
                              onChange={(e) => setEditedWeapon(prev => 
                                prev ? { ...prev, price: parseInt(e.target.value) } : null
                              )}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          ) : (
                            <div className="text-lg font-bold text-green-400">${selectedWeapon.price}</div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-white">Enabled</Label>
                            <div className="text-sm text-gray-400">
                              Players can purchase and use this weapon
                            </div>
                          </div>
                          <Button
                            onClick={() => handleToggleEnabled(selectedWeapon.id)}
                            variant={selectedWeapon.enabled ? "default" : "outline"}
                          >
                            {selectedWeapon.enabled ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a weapon to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}