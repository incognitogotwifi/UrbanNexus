import { create } from 'zustand';
import { ChatMessage } from '../../types/game';

interface ChatState {
  messages: ChatMessage[];
  isVisible: boolean;
  inputValue: string;
  chatMode: 'global' | 'gang';
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  toggleVisibility: () => void;
  setInputValue: (value: string) => void;
  setChatMode: (mode: 'global' | 'gang') => void;
  clearMessages: () => void;
}

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  isVisible: true,
  inputValue: '',
  chatMode: 'global',
  
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages.slice(-49), message] // Keep last 50 messages
    }));
  },
  
  toggleVisibility: () => {
    set((state) => ({ isVisible: !state.isVisible }));
  },
  
  setInputValue: (value: string) => {
    set({ inputValue: value });
  },
  
  setChatMode: (mode: 'global' | 'gang') => {
    set({ chatMode: mode });
  },
  
  clearMessages: () => {
    set({ messages: [] });
  }
}));
