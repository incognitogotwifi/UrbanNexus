import { GameEvent } from '../types/game';

export class NetworkManager {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, (event: GameEvent) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  connect(url: string) {
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('Connected to game server');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };
      
      this.socket.onmessage = (event) => {
        try {
          const gameEvent: GameEvent = JSON.parse(event.data);
          this.handleEvent(gameEvent);
        } catch (error) {
          console.error('Error parsing game event:', error);
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('Disconnected from game server', event.code, event.reason);
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error });
      };
      
    } catch (error) {
      console.error('Error connecting to game server:', error);
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  send(event: GameEvent) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      console.warn('Cannot send event: WebSocket not connected');
    }
  }
  
  on(eventType: string, handler: (event: GameEvent) => void) {
    this.eventHandlers.set(eventType, handler);
  }
  
  off(eventType: string) {
    this.eventHandlers.delete(eventType);
  }
  
  private handleEvent(event: GameEvent) {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      handler(event);
    }
    
    // Emit to general handler
    const generalHandler = this.eventHandlers.get('*');
    if (generalHandler) {
      generalHandler(event);
    }
  }
  
  private emit(eventType: string, data: any) {
    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      handler({ type: eventType, payload: data } as GameEvent);
    }
  }
  
  private scheduleReconnect() {
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(this.socket?.url || '');
    }, this.reconnectDelay * this.reconnectAttempts);
  }
  
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const networkManager = new NetworkManager();
