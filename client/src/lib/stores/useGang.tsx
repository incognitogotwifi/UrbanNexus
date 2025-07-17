import { create } from 'zustand';
import { Gang } from '../../types/game';

interface GangState {
  gangs: Record<string, Gang>;
  currentGang: Gang | null;
  
  // Actions
  createGang: (name: string, leaderId: string) => void;
  joinGang: (gangId: string, playerId: string) => void;
  leaveGang: (playerId: string) => void;
  updateGang: (gangId: string, updates: Partial<Gang>) => void;
  getGang: (gangId: string) => Gang | null;
  isGangMember: (gangId: string, playerId: string) => boolean;
  getGangColor: (gangId: string) => string;
}

export const useGang = create<GangState>((set, get) => ({
  gangs: {},
  currentGang: null,
  
  createGang: (name: string, leaderId: string) => {
    const gangId = `gang_${Date.now()}_${Math.random()}`;
    const gang: Gang = {
      id: gangId,
      name,
      leader: leaderId,
      members: [leaderId],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      territory: { x: 0, y: 0, width: 100, height: 100 },
      score: 0
    };
    
    set((state) => ({
      gangs: { ...state.gangs, [gangId]: gang }
    }));
  },
  
  joinGang: (gangId: string, playerId: string) => {
    set((state) => {
      const gang = state.gangs[gangId];
      if (!gang || gang.members.includes(playerId)) return state;
      
      const updatedGang = {
        ...gang,
        members: [...gang.members, playerId]
      };
      
      return {
        gangs: { ...state.gangs, [gangId]: updatedGang },
        currentGang: updatedGang
      };
    });
  },
  
  leaveGang: (playerId: string) => {
    set((state) => {
      const gangEntries = Object.entries(state.gangs);
      const playerGang = gangEntries.find(([_, gang]) => gang.members.includes(playerId));
      
      if (!playerGang) return state;
      
      const [gangId, gang] = playerGang;
      const updatedMembers = gang.members.filter(id => id !== playerId);
      
      // If no members left, remove gang
      if (updatedMembers.length === 0) {
        const { [gangId]: removed, ...remainingGangs } = state.gangs;
        return { gangs: remainingGangs, currentGang: null };
      }
      
      // If leader left, assign new leader
      const newLeader = gang.leader === playerId ? updatedMembers[0] : gang.leader;
      const updatedGang = {
        ...gang,
        leader: newLeader,
        members: updatedMembers
      };
      
      return {
        gangs: { ...state.gangs, [gangId]: updatedGang },
        currentGang: null
      };
    });
  },
  
  updateGang: (gangId: string, updates: Partial<Gang>) => {
    set((state) => {
      const gang = state.gangs[gangId];
      if (!gang) return state;
      
      const updatedGang = { ...gang, ...updates };
      
      return {
        gangs: { ...state.gangs, [gangId]: updatedGang },
        currentGang: state.currentGang?.id === gangId ? updatedGang : state.currentGang
      };
    });
  },
  
  getGang: (gangId: string) => {
    const { gangs } = get();
    return gangs[gangId] || null;
  },
  
  isGangMember: (gangId: string, playerId: string) => {
    const { gangs } = get();
    const gang = gangs[gangId];
    return gang ? gang.members.includes(playerId) : false;
  },
  
  getGangColor: (gangId: string) => {
    const { gangs } = get();
    const gang = gangs[gangId];
    return gang ? gang.color : '#ffffff';
  }
}));
