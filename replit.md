# Urban MMO Game

## Overview

This is a full-stack multiplayer urban MMO game built with React, Express, and PostgreSQL. The game features real-time gameplay with WebSocket connections, 3D graphics using Three.js, gang system, weapon mechanics, and map editing capabilities. Players can join the game, form gangs, battle other players, and explore an urban environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Latest Updates (January 2025)
- **Complete Admin System Overhaul**: Redesigned admin panel with hierarchical role-based permissions
- **File Browser Enhancement**: Reorganized into logical folder structure with permission-based access control
- **Player Role Assignment**: Automatic role assignment system (owner for jarredmilam5, player for others)
- **Player Main Menu**: Separate player-accessible interface with profile, stats, settings, and help
- **Enhanced Map Editor**: Added NPC support, collision editing, and current map editing capabilities
- **Player Logs System**: Comprehensive logging system for player activities with filtering and export
- **Admin Commands Integration**: Implemented command system from uploaded reference file
- **File Upload System**: Permission-based file upload with folder selection restrictions

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Three.js** ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing) for 3D graphics rendering
- **Radix UI** components for consistent UI elements
- **Tailwind CSS** for styling with custom design tokens
- **Zustand** stores for state management (game state, audio, chat, gangs, etc.)
- **TanStack React Query** for server state management
- **Vite** for build tooling and development server

### Backend Architecture
- **Express.js** server with TypeScript
- **WebSocket** integration for real-time multiplayer communication
- **Drizzle ORM** with PostgreSQL for database operations
- **Class-based game managers** for different game systems:
  - GameServer: Main game loop and WebSocket handling
  - PlayerManager: Player lifecycle and spawning
  - GangManager: Gang creation and management
  - WeaponManager: Weapon system and stats
  - MapManager: Map loading and tile generation

## Key Components

### Game Systems
- **Real-time Multiplayer**: WebSocket-based communication for game events
- **3D Rendering**: Three.js for 3D player models, bullets, and environment
- **Gang System**: Players can create/join gangs with territory control
- **Weapon System**: Multiple weapon types with different stats and behaviors
- **Map System**: Tile-based maps with collision detection and multiple layers
- **Chat System**: Global and gang-specific chat channels
- **Admin Panel**: Moderation tools for staff members

### Client-Side State Management
- **useMultiplayer**: WebSocket connection and game state synchronization
- **usePlayer**: Local player state and movement
- **useGameWorld**: Map loading and collision detection
- **useGang**: Gang membership and operations
- **useWeapons**: Weapon switching and stats
- **useChat**: Chat messaging and channel management
- **useAudio**: Sound effects and music control

### Server-Side Game Logic
- **GameStateManager**: Centralized game state with tick-based updates
- **Collision Detection**: AABB collision system for players and bullets
- **Spawn System**: Player respawning with cooldown timers
- **Territory Control**: Gang-based area control mechanics

## Data Flow

### Client to Server
1. User input (movement, shooting, chat) → WebSocket events
2. Game events serialized as JSON and sent to server
3. Server validates and processes events
4. Server updates game state and broadcasts to all clients

### Server to Client
1. Game state updates broadcasted via WebSocket
2. Client receives and deserializes game events
3. Local state stores updated with new data
4. React components re-render with updated state
5. Three.js scene updated with new positions/states

### Database Operations
- User authentication and profile data
- Game statistics and leaderboards
- Gang information and member lists
- Map data and custom maps (when saved)

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Database connection for Neon PostgreSQL
- **WebSocket (ws)**: Server-side WebSocket implementation
- **Three.js ecosystem**: 3D graphics rendering
- **Drizzle ORM**: Type-safe database operations
- **Vite**: Build tooling with HMR support

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with tsx for TypeScript execution
- WebSocket server runs on the same port as HTTP server
- Database migrations via Drizzle Kit

### Production Build
- Frontend: Vite builds optimized bundle to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Single server process handles both HTTP and WebSocket connections
- Environment variables for database connection and configuration

### Database
- PostgreSQL database (configured for Neon)
- Drizzle ORM handles schema management and migrations
- Database URL required via environment variable
- Simple user schema with username/password authentication

The application uses a monorepo structure with shared types and utilities between client and server, enabling type-safe communication and reducing code duplication.