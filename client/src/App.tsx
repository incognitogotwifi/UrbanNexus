import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Game from './components/Game';
import { useAudio } from './lib/stores/useAudio';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import "@fontsource/inter";

const queryClient = new QueryClient();

function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-login for testing - accept any input
    if (isSignUp) {
      if (email.trim() && password.trim() && username.trim()) {
        setIsLoading(true);
        // Simulate signup delay
        await new Promise(resolve => setTimeout(resolve, 500));
        onLogin(username.trim());
      }
    } else {
      if (email.trim() && password.trim()) {
        setIsLoading(true);
        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // For testing, use email as username if no username provided
        onLogin(username.trim() || email.split('@')[0]);
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Urban MMO</CardTitle>
          <CardDescription className="text-gray-300">
            {isSignUp ? 'Join the streets and start your journey' : 'Enter the streets and join the battle'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose your username"
                  className="bg-gray-800 border-gray-600 text-white"
                  maxLength={20}
                  required
                />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || (isSignUp && !username.trim())}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Connecting...' : (isSignUp ? 'Create Account & Enter' : 'Login & Enter')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p className="bg-yellow-900/20 text-yellow-400 p-2 rounded mb-2">
              Testing Mode: Any email/password will work
            </p>
            <p>Inspired by Graal Online and Corleone Online</p>
            <p className="mt-2">Features:</p>
            <ul className="mt-1 text-xs">
              <li>• Multiplayer PvP combat</li>
              <li>• Gang system with territory control</li>
              <li>• Real-time map editor</li>
              <li>• Admin tools and scripting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  const [gameState, setGameState] = useState<'login' | 'game'>('login');
  const [username, setUsername] = useState('');
  const { toggleMute, isMuted } = useAudio();
  
  // Initialize audio on first user interaction
  useEffect(() => {
    const initializeAudio = () => {
      // Load audio files
      const backgroundMusic = new Audio('/sounds/background.mp3');
      const hitSound = new Audio('/sounds/hit.mp3');
      const successSound = new Audio('/sounds/success.mp3');
      
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.3;
      
      // Set up audio in store
      // Note: Audio initialization would go here
      
      document.removeEventListener('click', initializeAudio);
    };
    
    document.addEventListener('click', initializeAudio);
    return () => document.removeEventListener('click', initializeAudio);
  }, []);
  
  const handleLogin = (user: string) => {
    setUsername(user);
    setGameState('game');
  };
  
  const handleExit = () => {
    setGameState('login');
    setUsername('');
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-full overflow-hidden">
        {/* Audio controls */}
        <button
          onClick={toggleMute}
          className="fixed top-4 left-4 z-50 bg-black bg-opacity-70 text-white p-2 rounded-lg hover:bg-opacity-90 transition-all"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        
        {gameState === 'login' && (
          <LoginScreen onLogin={handleLogin} />
        )}
        
        {gameState === 'game' && (
          <Game username={username} onExit={handleExit} />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
