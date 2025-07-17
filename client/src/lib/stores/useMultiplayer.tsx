import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GameEvent, GameState, Player, Bullet, ChatMessage } from '../../types/game';

interface MultiplayerState {
  socket: WebSocket | null;
  isConnected: boolean;
  currentPlayer: Player | null;
  gameState: GameState | null;
  
  // Actions
  connect: (username: string) => void;
  disconnect: () => void;
  sendEvent: (event: GameEvent) => void;
  movePlayer: (position: { x: number; y: number }) => void;
  shootBullet: (direction: { x: number; y: number }) => void;
  sendChatMessage: (message: string, type: 'global' | 'gang') => void;
}

export const useMultiplayer = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    socket: null,
    isConnected: false,
    currentPlayer: null,
    gameState: null,
    
    connect: (username: string) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/game-ws`);
      
      socket.onopen = () => {
        console.log('Connected to game server');
        set({ isConnected: true, socket });
        
        // Send join event
        const joinEvent: GameEvent = {
          type: 'PLAYER_JOIN',
          payload: {
            player: {
              id: '',
              username,
              position: { x: 0, y: 0 },
              health: 100,
              maxHealth: 100,
              ammo: 100,
              currency: 0,
              kills: 0,
              deaths: 0,
              gangId: null,
              gangRank: 'member',
              weapon: 'pistol',
              isAlive: true,
              lastShot: 0,
              color: `hsl(${Math.random() * 360}, 70%, 50%)`
            }
          }
        };
        
        socket.send(JSON.stringify(joinEvent));
      };
      
      socket.onmessage = (event) => {
        try {
          const gameEvent: GameEvent = JSON.parse(event.data);
          
          switch (gameEvent.type) {
            case 'GAME_STATE_UPDATE':
              const { gameState } = gameEvent.payload;
              set((state) => ({
                gameState: { ...state.gameState, ...gameState } as GameState
              }));
              break;
              
            case 'PLAYER_JOIN':
              const { player } = gameEvent.payload;
              set((state) => ({
                currentPlayer: player.username === username ? player : state.currentPlayer,
                gameState: state.gameState ? {
                  ...state.gameState,
                  players: { ...state.gameState.players, [player.id]: player }
                } : state.gameState
              }));
              break;
              
            default:
              console.log('Received game event:', gameEvent);
          }
        } catch (error) {
          console.error('Error parsing game event:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('Disconnected from game server');
        set({ isConnected: false, socket: null });
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    },
    
    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
    },
    
    sendEvent: (event: GameEvent) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify(event));
      }
    },
    
    movePlayer: (position: { x: number; y: number }) => {
      const { currentPlayer, sendEvent } = get();
      if (currentPlayer) {
        sendEvent({
          type: 'PLAYER_MOVE',
          payload: { playerId: currentPlayer.id, position }
        });
      }
    },
    
    shootBullet: (direction: { x: number; y: number }) => {
      const { currentPlayer, sendEvent } = get();
      if (currentPlayer) {
        const bullet: Bullet = {
          id: `bullet_${Date.now()}_${Math.random()}`,
          playerId: currentPlayer.id,
          position: { ...currentPlayer.position },
          direction,
          damage: 25,
          speed: 500,
          lifetime: 2000,
          weapon: currentPlayer.weapon
        };
        
        sendEvent({
          type: 'PLAYER_SHOOT',
          payload: { playerId: currentPlayer.id, bullet }
        });
      }
    },
    
    sendChatMessage: (message: string, type: 'global' | 'gang') => {
      const { currentPlayer, sendEvent } = get();
      if (currentPlayer && message.trim()) {
        const chatMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          playerId: currentPlayer.id,
          username: currentPlayer.username,
          message: message.trim(),
          timestamp: Date.now(),
          type
        };
        
        sendEvent({
          type: 'CHAT_MESSAGE',
          payload: { message: chatMessage }
        });
      }
    }
  }))
);
