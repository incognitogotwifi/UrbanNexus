import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Save, RotateCcw, Server, Users, Shield, Zap } from 'lucide-react';

interface ServerConfigProps {
  onClose: () => void;
}

interface ServerSettings {
  general: {
    serverName: string;
    maxPlayers: number;
    tickRate: number;
    welcomeMessage: string;
    motd: string;
  };
  gameplay: {
    pvpEnabled: boolean;
    friendlyFire: boolean;
    respawnTime: number;
    startingMoney: number;
    killReward: number;
    deathPenalty: number;
    weaponDrops: boolean;
    autoBalance: boolean;
  };
  moderation: {
    autoKick: boolean;
    maxWarnings: number;
    spamProtection: boolean;
    profanityFilter: boolean;
    reportSystem: boolean;
    banDuration: number;
    ipBanning: boolean;
  };
  economy: {
    economyEnabled: boolean;
    weaponPrices: { [key: string]: number };
    dailyReward: number;
    shopEnabled: boolean;
    tradingEnabled: boolean;
    currencyName: string;
  };
}

const defaultSettings: ServerSettings = {
  general: {
    serverName: 'Urban MMO Server',
    maxPlayers: 100,
    tickRate: 60,
    welcomeMessage: 'Welcome to Urban MMO!',
    motd: 'Join gangs, fight for territory, and dominate the streets!'
  },
  gameplay: {
    pvpEnabled: true,
    friendlyFire: false,
    respawnTime: 5000,
    startingMoney: 1000,
    killReward: 100,
    deathPenalty: 50,
    weaponDrops: true,
    autoBalance: false
  },
  moderation: {
    autoKick: true,
    maxWarnings: 3,
    spamProtection: true,
    profanityFilter: true,
    reportSystem: true,
    banDuration: 86400000, // 24 hours
    ipBanning: false
  },
  economy: {
    economyEnabled: true,
    weaponPrices: {
      pistol: 500,
      rifle: 1200,
      shotgun: 800,
      smg: 900,
      sniper: 2000,
      ak47: 1500,
      m4a1: 1400
    },
    dailyReward: 200,
    shopEnabled: true,
    tradingEnabled: true,
    currencyName: 'Money'
  }
};

export default function ServerConfig({ onClose }: ServerConfigProps) {
  const [settings, setSettings] = useState<ServerSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (category: keyof ServerSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/server/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setHasChanges(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Server className="w-6 h-6" />
                Server Configuration
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configure server settings, gameplay rules, and moderation options
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="economy">Economy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">General Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Server Name</Label>
                    <Input
                      value={settings.general.serverName}
                      onChange={(e) => updateSetting('general', 'serverName', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Max Players</Label>
                    <Input
                      type="number"
                      value={settings.general.maxPlayers}
                      onChange={(e) => updateSetting('general', 'maxPlayers', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Tick Rate (FPS)</Label>
                    <Select 
                      value={settings.general.tickRate.toString()} 
                      onValueChange={(value) => updateSetting('general', 'tickRate', parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                        <SelectItem value="120">120 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Welcome Message</Label>
                    <Input
                      value={settings.general.welcomeMessage}
                      onChange={(e) => updateSetting('general', 'welcomeMessage', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Message of the Day</Label>
                    <Input
                      value={settings.general.motd}
                      onChange={(e) => updateSetting('general', 'motd', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="gameplay" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Gameplay Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">PvP Enabled</Label>
                    <Switch
                      checked={settings.gameplay.pvpEnabled}
                      onCheckedChange={(checked) => updateSetting('gameplay', 'pvpEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Friendly Fire</Label>
                    <Switch
                      checked={settings.gameplay.friendlyFire}
                      onCheckedChange={(checked) => updateSetting('gameplay', 'friendlyFire', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Weapon Drops</Label>
                    <Switch
                      checked={settings.gameplay.weaponDrops}
                      onCheckedChange={(checked) => updateSetting('gameplay', 'weaponDrops', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Auto Balance Teams</Label>
                    <Switch
                      checked={settings.gameplay.autoBalance}
                      onCheckedChange={(checked) => updateSetting('gameplay', 'autoBalance', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Respawn Time (ms)</Label>
                    <Input
                      type="number"
                      value={settings.gameplay.respawnTime}
                      onChange={(e) => updateSetting('gameplay', 'respawnTime', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Starting Money</Label>
                    <Input
                      type="number"
                      value={settings.gameplay.startingMoney}
                      onChange={(e) => updateSetting('gameplay', 'startingMoney', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Kill Reward</Label>
                    <Input
                      type="number"
                      value={settings.gameplay.killReward}
                      onChange={(e) => updateSetting('gameplay', 'killReward', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Death Penalty</Label>
                    <Input
                      type="number"
                      value={settings.gameplay.deathPenalty}
                      onChange={(e) => updateSetting('gameplay', 'deathPenalty', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="moderation" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Moderation Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Auto Kick</Label>
                    <Switch
                      checked={settings.moderation.autoKick}
                      onCheckedChange={(checked) => updateSetting('moderation', 'autoKick', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Spam Protection</Label>
                    <Switch
                      checked={settings.moderation.spamProtection}
                      onCheckedChange={(checked) => updateSetting('moderation', 'spamProtection', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Profanity Filter</Label>
                    <Switch
                      checked={settings.moderation.profanityFilter}
                      onCheckedChange={(checked) => updateSetting('moderation', 'profanityFilter', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Report System</Label>
                    <Switch
                      checked={settings.moderation.reportSystem}
                      onCheckedChange={(checked) => updateSetting('moderation', 'reportSystem', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">IP Banning</Label>
                    <Switch
                      checked={settings.moderation.ipBanning}
                      onCheckedChange={(checked) => updateSetting('moderation', 'ipBanning', checked)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Max Warnings</Label>
                    <Input
                      type="number"
                      value={settings.moderation.maxWarnings}
                      onChange={(e) => updateSetting('moderation', 'maxWarnings', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Ban Duration (hours)</Label>
                    <Input
                      type="number"
                      value={settings.moderation.banDuration / 3600000}
                      onChange={(e) => updateSetting('moderation', 'banDuration', parseInt(e.target.value) * 3600000)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="economy" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 text-green-400">💰</div>
                <h3 className="text-lg font-semibold text-white">Economy Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Economy Enabled</Label>
                    <Switch
                      checked={settings.economy.economyEnabled}
                      onCheckedChange={(checked) => updateSetting('economy', 'economyEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Shop Enabled</Label>
                    <Switch
                      checked={settings.economy.shopEnabled}
                      onCheckedChange={(checked) => updateSetting('economy', 'shopEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Trading Enabled</Label>
                    <Switch
                      checked={settings.economy.tradingEnabled}
                      onCheckedChange={(checked) => updateSetting('economy', 'tradingEnabled', checked)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Currency Name</Label>
                    <Input
                      value={settings.economy.currencyName}
                      onChange={(e) => updateSetting('economy', 'currencyName', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Daily Reward</Label>
                    <Input
                      type="number"
                      value={settings.economy.dailyReward}
                      onChange={(e) => updateSetting('economy', 'dailyReward', parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white">Weapon Prices</h4>
                  {Object.entries(settings.economy.weaponPrices).map(([weapon, price]) => (
                    <div key={weapon} className="flex items-center justify-between">
                      <Label className="text-white capitalize">{weapon.replace('_', ' ')}</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => updateSetting('economy', 'weaponPrices', {
                          ...settings.economy.weaponPrices,
                          [weapon]: parseInt(e.target.value)
                        })}
                        className="bg-gray-800 border-gray-600 text-white w-24"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}