import { Gang, Player } from '../client/src/types/game';
import { GameStateManager } from './gameState';

export class GangManager {
  private gameState: GameStateManager;
  private maxGangSize: number = 4;
  private gangWars: Map<string, {
    gang1: string;
    gang2: string;
    startTime: number;
    endTime: number;
    winner?: string;
  }> = new Map();
  
  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }
  
  public createGang(name: string, leaderId: string, color?: string): Gang | null {
    const leader = this.gameState.getPlayer(leaderId);
    if (!leader) {
      console.log(`[GangManager] Cannot create gang: leader ${leaderId} not found`);
      return null;
    }
    
    if (leader.gangId) {
      console.log(`[GangManager] Cannot create gang: leader ${leaderId} already in gang ${leader.gangId}`);
      return null;
    }
    
    // Check if gang name already exists
    const existingGang = this.findGangByName(name);
    if (existingGang) {
      console.log(`[GangManager] Cannot create gang: name "${name}" already exists`);
      return null;
    }
    
    const gangId = this.generateGangId();
    const gang: Gang = {
      id: gangId,
      name: name.trim(),
      leader: leaderId,
      members: [leaderId],
      color: color || this.generateGangColor(),
      territory: this.generateGangTerritory(),
      score: 0
    };
    
    // Update leader's gang info
    leader.gangId = gangId;
    leader.gangRank = 'leader';
    
    this.gameState.addGang(gang);
    
    console.log(`[GangManager] Gang "${name}" created by ${leader.username} (${gangId})`);
    
    return gang;
  }
  
  public disbandGang(gangId: string, requesterId: string): boolean {
    const gang = this.gameState.getGang(gangId);
    if (!gang) {
      console.log(`[GangManager] Cannot disband gang: gang ${gangId} not found`);
      return false;
    }
    
    if (gang.leader !== requesterId) {
      console.log(`[GangManager] Cannot disband gang: ${requesterId} is not the leader`);
      return false;
    }
    
    // Remove gang from all members
    for (const memberId of gang.members) {
      const member = this.gameState.getPlayer(memberId);
      if (member) {
        member.gangId = null;
        member.gangRank = 'member';
      }
    }
    
    this.gameState.removeGang(gangId);
    
    console.log(`[GangManager] Gang "${gang.name}" (${gangId}) disbanded by ${requesterId}`);
    
    return true;
  }
  
  public joinGang(gangId: string, playerId: string): boolean {
    const gang = this.gameState.getGang(gangId);
    const player = this.gameState.getPlayer(playerId);
    
    if (!gang) {
      console.log(`[GangManager] Cannot join gang: gang ${gangId} not found`);
      return false;
    }
    
    if (!player) {
      console.log(`[GangManager] Cannot join gang: player ${playerId} not found`);
      return false;
    }
    
    if (player.gangId) {
      console.log(`[GangManager] Cannot join gang: player ${playerId} already in gang ${player.gangId}`);
      return false;
    }
    
    if (gang.members.length >= this.maxGangSize) {
      console.log(`[GangManager] Cannot join gang: gang ${gangId} is full`);
      return false;
    }
    
    // Add player to gang
    gang.members.push(playerId);
    player.gangId = gangId;
    player.gangRank = 'member';
    
    console.log(`[GangManager] Player ${player.username} (${playerId}) joined gang "${gang.name}"`);
    
    return true;
  }
  
  public leaveGang(playerId: string): boolean {
    const player = this.gameState.getPlayer(playerId);
    if (!player || !player.gangId) {
      console.log(`[GangManager] Cannot leave gang: player ${playerId} not in a gang`);
      return false;
    }
    
    const gang = this.gameState.getGang(player.gangId);
    if (!gang) {
      console.log(`[GangManager] Cannot leave gang: gang ${player.gangId} not found`);
      return false;
    }
    
    // Remove player from gang
    const memberIndex = gang.members.indexOf(playerId);
    if (memberIndex !== -1) {
      gang.members.splice(memberIndex, 1);
    }
    
    player.gangId = null;
    player.gangRank = 'member';
    
    console.log(`[GangManager] Player ${player.username} (${playerId}) left gang "${gang.name}"`);
    
    // If gang is empty, remove it
    if (gang.members.length === 0) {
      this.gameState.removeGang(gang.id);
      console.log(`[GangManager] Gang "${gang.name}" removed (no members)`);
    } else if (gang.leader === playerId) {
      // Assign new leader
      const newLeader = gang.members[0];
      gang.leader = newLeader;
      
      const newLeaderPlayer = this.gameState.getPlayer(newLeader);
      if (newLeaderPlayer) {
        newLeaderPlayer.gangRank = 'leader';
      }
      
      console.log(`[GangManager] New leader assigned to gang "${gang.name}": ${newLeader}`);
    }
    
    return true;
  }
  
  public kickMember(gangId: string, leaderId: string, memberId: string): boolean {
    const gang = this.gameState.getGang(gangId);
    const leader = this.gameState.getPlayer(leaderId);
    const member = this.gameState.getPlayer(memberId);
    
    if (!gang || !leader || !member) {
      console.log(`[GangManager] Cannot kick member: invalid gang, leader, or member`);
      return false;
    }
    
    if (gang.leader !== leaderId) {
      console.log(`[GangManager] Cannot kick member: ${leaderId} is not the leader`);
      return false;
    }
    
    if (memberId === leaderId) {
      console.log(`[GangManager] Cannot kick member: leader cannot kick themselves`);
      return false;
    }
    
    if (!gang.members.includes(memberId)) {
      console.log(`[GangManager] Cannot kick member: ${memberId} is not in the gang`);
      return false;
    }
    
    // Remove member from gang
    const memberIndex = gang.members.indexOf(memberId);
    if (memberIndex !== -1) {
      gang.members.splice(memberIndex, 1);
    }
    
    member.gangId = null;
    member.gangRank = 'member';
    
    console.log(`[GangManager] Player ${member.username} (${memberId}) kicked from gang "${gang.name}" by ${leader.username}`);
    
    return true;
  }
  
  public promoteToLeader(gangId: string, currentLeaderId: string, newLeaderId: string): boolean {
    const gang = this.gameState.getGang(gangId);
    const currentLeader = this.gameState.getPlayer(currentLeaderId);
    const newLeader = this.gameState.getPlayer(newLeaderId);
    
    if (!gang || !currentLeader || !newLeader) {
      console.log(`[GangManager] Cannot promote: invalid gang, current leader, or new leader`);
      return false;
    }
    
    if (gang.leader !== currentLeaderId) {
      console.log(`[GangManager] Cannot promote: ${currentLeaderId} is not the current leader`);
      return false;
    }
    
    if (!gang.members.includes(newLeaderId)) {
      console.log(`[GangManager] Cannot promote: ${newLeaderId} is not in the gang`);
      return false;
    }
    
    // Update leadership
    gang.leader = newLeaderId;
    currentLeader.gangRank = 'member';
    newLeader.gangRank = 'leader';
    
    console.log(`[GangManager] Leadership of gang "${gang.name}" transferred from ${currentLeader.username} to ${newLeader.username}`);
    
    return true;
  }
  
  public updateGangScore(gangId: string, scoreChange: number): void {
    const gang = this.gameState.getGang(gangId);
    if (!gang) return;
    
    gang.score = Math.max(0, gang.score + scoreChange);
    console.log(`[GangManager] Gang "${gang.name}" score updated by ${scoreChange} (total: ${gang.score})`);
  }
  
  public getGangStats(gangId: string): {
    totalKills: number;
    totalDeaths: number;
    totalMembers: number;
    avgKDR: number;
    territoryControl: number;
  } | null {
    const gang = this.gameState.getGang(gangId);
    if (!gang) return null;
    
    let totalKills = 0;
    let totalDeaths = 0;
    let validMembers = 0;
    
    for (const memberId of gang.members) {
      const member = this.gameState.getPlayer(memberId);
      if (member) {
        totalKills += member.kills;
        totalDeaths += member.deaths;
        validMembers++;
      }
    }
    
    return {
      totalKills,
      totalDeaths,
      totalMembers: validMembers,
      avgKDR: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
      territoryControl: this.calculateTerritoryControl(gangId)
    };
  }
  
  public getGangLeaderboard(): Array<{
    gangId: string;
    name: string;
    score: number;
    members: number;
    avgKDR: number;
  }> {
    const gangs = Object.values(this.gameState.getGameState().gangs);
    
    return gangs
      .map(gang => {
        const stats = this.getGangStats(gang.id);
        return {
          gangId: gang.id,
          name: gang.name,
          score: gang.score,
          members: gang.members.length,
          avgKDR: stats?.avgKDR || 0
        };
      })
      .sort((a, b) => b.score - a.score);
  }
  
  public startGangWar(gang1Id: string, gang2Id: string, duration: number = 600000): boolean {
    const gang1 = this.gameState.getGang(gang1Id);
    const gang2 = this.gameState.getGang(gang2Id);
    
    if (!gang1 || !gang2) {
      console.log(`[GangManager] Cannot start gang war: invalid gangs`);
      return false;
    }
    
    const warId = `war_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const war = {
      gang1: gang1Id,
      gang2: gang2Id,
      startTime: Date.now(),
      endTime: Date.now() + duration
    };
    
    this.gangWars.set(warId, war);
    
    console.log(`[GangManager] Gang war started between "${gang1.name}" and "${gang2.name}" (${warId})`);
    
    // Schedule war end
    setTimeout(() => {
      this.endGangWar(warId);
    }, duration);
    
    return true;
  }
  
  private endGangWar(warId: string): void {
    const war = this.gangWars.get(warId);
    if (!war) return;
    
    const gang1 = this.gameState.getGang(war.gang1);
    const gang2 = this.gameState.getGang(war.gang2);
    
    if (!gang1 || !gang2) return;
    
    const gang1Stats = this.getGangStats(war.gang1);
    const gang2Stats = this.getGangStats(war.gang2);
    
    if (!gang1Stats || !gang2Stats) return;
    
    // Determine winner based on kills during war period
    let winner: string;
    if (gang1Stats.totalKills > gang2Stats.totalKills) {
      winner = war.gang1;
      this.updateGangScore(war.gang1, 100);
    } else if (gang2Stats.totalKills > gang1Stats.totalKills) {
      winner = war.gang2;
      this.updateGangScore(war.gang2, 100);
    } else {
      winner = 'tie';
    }
    
    war.winner = winner;
    
    console.log(`[GangManager] Gang war ended (${warId}): winner = ${winner}`);
    
    // Remove war from active wars
    this.gangWars.delete(warId);
  }
  
  private calculateTerritoryControl(gangId: string): number {
    const gang = this.gameState.getGang(gangId);
    if (!gang) return 0;
    
    // Calculate territory control based on gang territory size
    const territorySize = gang.territory.width * gang.territory.height;
    const mapSize = this.gameState.getCurrentMap().width * this.gameState.getCurrentMap().height;
    
    return Math.min(100, (territorySize / mapSize) * 100);
  }
  
  private findGangByName(name: string): Gang | null {
    const gangs = Object.values(this.gameState.getGameState().gangs);
    return gangs.find(gang => gang.name.toLowerCase() === name.toLowerCase()) || null;
  }
  
  private generateGangId(): string {
    return `gang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateGangColor(): string {
    const colors = [
      '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
      '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
      '#f1c40f', '#e91e63', '#9c27b0', '#673ab7'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  private generateGangTerritory(): { x: number; y: number; width: number; height: number } {
    const map = this.gameState.getCurrentMap();
    const maxWidth = 200;
    const maxHeight = 200;
    
    return {
      x: Math.floor(Math.random() * (map.width - maxWidth)),
      y: Math.floor(Math.random() * (map.height - maxHeight)),
      width: maxWidth,
      height: maxHeight
    };
  }
}
