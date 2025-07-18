import { AdminRole, AdminPermission, AdminRoleType } from '../types/game';

export const ADMIN_PERMISSIONS: AdminPermission[] = [
  // Player Management
  { id: 'player_ban', name: 'Ban Players', description: 'Ban players from the game', category: 'player' },
  { id: 'player_kick', name: 'Kick Players', description: 'Kick players from the game', category: 'player' },
  { id: 'player_mute', name: 'Mute Players', description: 'Mute players in chat', category: 'player' },
  { id: 'player_teleport', name: 'Teleport Players', description: 'Teleport players to locations', category: 'player' },
  { id: 'player_heal', name: 'Heal Players', description: 'Heal players instantly', category: 'player' },
  { id: 'player_stats', name: 'View Player Stats', description: 'View detailed player statistics', category: 'player' },
  { id: 'player_modify', name: 'Modify Players', description: 'Modify player attributes', category: 'player' },
  
  // Content Management
  { id: 'map_edit', name: 'Edit Maps', description: 'Create and edit game maps', category: 'content' },
  { id: 'map_publish', name: 'Publish Maps', description: 'Publish maps to live game', category: 'content' },
  { id: 'npc_create', name: 'Create NPCs', description: 'Create and manage NPCs', category: 'content' },
  { id: 'npc_edit', name: 'Edit NPCs', description: 'Edit existing NPCs', category: 'content' },
  { id: 'weapon_create', name: 'Create Weapons', description: 'Create new weapon types', category: 'content' },
  { id: 'weapon_edit', name: 'Edit Weapons', description: 'Modify weapon properties', category: 'content' },
  { id: 'asset_manage', name: 'Manage Assets', description: 'Upload and manage game assets', category: 'content' },
  
  // System Management
  { id: 'server_config', name: 'Server Config', description: 'Configure server settings', category: 'system' },
  { id: 'server_restart', name: 'Restart Server', description: 'Restart game server', category: 'system' },
  { id: 'logs_view', name: 'View Logs', description: 'View system and player logs', category: 'system' },
  { id: 'backup_create', name: 'Create Backups', description: 'Create system backups', category: 'system' },
  { id: 'backup_restore', name: 'Restore Backups', description: 'Restore from backups', category: 'system' },
  { id: 'analytics_view', name: 'View Analytics', description: 'View game analytics and metrics', category: 'system' },
  
  // Development
  { id: 'script_create', name: 'Create Scripts', description: 'Create game scripts', category: 'development' },
  { id: 'script_edit', name: 'Edit Scripts', description: 'Edit existing scripts', category: 'development' },
  { id: 'script_execute', name: 'Execute Scripts', description: 'Execute scripts in game environment', category: 'development' },
  { id: 'file_browser', name: 'File Browser', description: 'Access game file browser', category: 'development' },
  { id: 'debug_mode', name: 'Debug Mode', description: 'Enable debug mode and tools', category: 'development' },
  { id: 'role_assign', name: 'Assign Roles', description: 'Assign roles to other users', category: 'system' },
];

export const ADMIN_ROLES: Record<AdminRoleType, AdminRole> = {
  owner: {
    id: 'owner',
    name: 'Owner',
    level: 100,
    permissions: ADMIN_PERMISSIONS,
    canAssign: ['owner', 'management', 'graphics_lead', 'animation_lead', 'scripting_lead', 'sfx_lead', 'weapons_lead', 'support_lead', 'graphics_dev', 'animation_dev', 'scripting_dev', 'sfx_dev', 'weapons_dev', 'support_staff', 'player'],
    color: '#ff0000'
  },
  management: {
    id: 'management',
    name: 'Management',
    level: 90,
    permissions: ADMIN_PERMISSIONS.filter(p => p.category !== 'development' || p.id === 'debug_mode'),
    canAssign: ['graphics_lead', 'animation_lead', 'scripting_lead', 'sfx_lead', 'weapons_lead', 'support_lead', 'graphics_dev', 'animation_dev', 'scripting_dev', 'sfx_dev', 'weapons_dev', 'support_staff', 'player'],
    color: '#ff8c00'
  },
  graphics_lead: {
    id: 'graphics_lead',
    name: 'Graphics Team Leader',
    level: 80,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'content' || 
      p.category === 'development' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view'
    ),
    canAssign: ['graphics_dev', 'player'],
    color: '#00ff00'
  },
  animation_lead: {
    id: 'animation_lead',
    name: 'Animation Team Leader',
    level: 80,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'content' || 
      p.category === 'development' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view'
    ),
    canAssign: ['animation_dev', 'player'],
    color: '#0080ff'
  },
  scripting_lead: {
    id: 'scripting_lead',
    name: 'Scripting Team Leader',
    level: 80,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'development' || 
      p.category === 'content' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view'
    ),
    canAssign: ['scripting_dev', 'player'],
    color: '#8000ff'
  },
  sfx_lead: {
    id: 'sfx_lead',
    name: 'SFX Team Leader',
    level: 80,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'content' || 
      p.category === 'development' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view'
    ),
    canAssign: ['sfx_dev', 'player'],
    color: '#ff0080'
  },
  weapons_lead: {
    id: 'weapons_lead',
    name: 'Weapons Team Leader',
    level: 80,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'content' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view' || 
      p.id === 'script_edit'
    ),
    canAssign: ['weapons_dev', 'player'],
    color: '#ff4000'
  },
  support_lead: {
    id: 'support_lead',
    name: 'Player Support Leader',
    level: 75,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'player' || 
      p.id === 'logs_view' || 
      p.id === 'analytics_view'
    ),
    canAssign: ['support_staff', 'player'],
    color: '#00ffff'
  },
  graphics_dev: {
    id: 'graphics_dev',
    name: 'Graphics Developer',
    level: 60,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.id === 'asset_manage' || 
      p.id === 'map_edit' || 
      p.id === 'npc_edit' || 
      p.id === 'file_browser'
    ),
    canAssign: ['player'],
    color: '#40ff40'
  },
  animation_dev: {
    id: 'animation_dev',
    name: 'Animation Developer',
    level: 60,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.id === 'asset_manage' || 
      p.id === 'npc_edit' || 
      p.id === 'file_browser'
    ),
    canAssign: ['player'],
    color: '#4080ff'
  },
  scripting_dev: {
    id: 'scripting_dev',
    name: 'Scripting Developer',
    level: 60,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.category === 'development' || 
      p.id === 'npc_edit' || 
      p.id === 'map_edit'
    ),
    canAssign: ['player'],
    color: '#8040ff'
  },
  sfx_dev: {
    id: 'sfx_dev',
    name: 'SFX Developer',
    level: 60,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.id === 'asset_manage' || 
      p.id === 'file_browser'
    ),
    canAssign: ['player'],
    color: '#ff4080'
  },
  weapons_dev: {
    id: 'weapons_dev',
    name: 'Weapons Developer',
    level: 60,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.id === 'weapon_create' || 
      p.id === 'weapon_edit' || 
      p.id === 'script_edit' || 
      p.id === 'file_browser'
    ),
    canAssign: ['player'],
    color: '#ff8040'
  },
  support_staff: {
    id: 'support_staff',
    name: 'Support Staff',
    level: 50,
    permissions: ADMIN_PERMISSIONS.filter(p => 
      p.id === 'player_kick' || 
      p.id === 'player_mute' || 
      p.id === 'player_heal' || 
      p.id === 'player_stats' || 
      p.id === 'logs_view'
    ),
    canAssign: ['player'],
    color: '#40ffff'
  },
  player: {
    id: 'player',
    name: 'Player',
    level: 0,
    permissions: [],
    canAssign: [],
    color: '#ffffff'
  }
};

export function hasPermission(userRole: AdminRoleType, permission: string): boolean {
  const role = ADMIN_ROLES[userRole];
  return role.permissions.some(p => p.id === permission);
}

export function canAssignRole(userRole: AdminRoleType, targetRole: AdminRoleType): boolean {
  const role = ADMIN_ROLES[userRole];
  return role.canAssign.includes(targetRole);
}

export function getRoleLevel(role: AdminRoleType): number {
  return ADMIN_ROLES[role].level;
}

export function getPermissionsByCategory(category: string): AdminPermission[] {
  return ADMIN_PERMISSIONS.filter(p => p.category === category);
}