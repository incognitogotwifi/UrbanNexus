# BrowserQuest - HTML5/JavaScript Multiplayer Game

## Overview

BrowserQuest is a real-time multiplayer 2D RPG game built entirely in JavaScript, featuring both client-side and server-side components. The game runs in web browsers using HTML5 Canvas and WebSocket technology for real-time communication. Players can explore a 2D world, chat with others, fight monsters, collect loot, and interact with NPCs.

**Status:** Successfully migrated from Mozilla BrowserQuest repository to Replit environment (January 2025). The server is now running on port 5000 with modern WebSocket implementation, PostgreSQL database integration, and all game systems operational.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: HTML5, CSS3, JavaScript (ES5), jQuery, Underscore.js
- **Module System**: AMD (RequireJS) for dependency management
- **Rendering**: HTML5 Canvas with multi-layer rendering (background, entities, foreground, cursor)
- **Graphics**: 2D sprite-based graphics with tile-based world
- **Responsive Design**: Mobile and tablet support with touch controls

### Backend Architecture
- **Runtime**: Node.js server
- **WebSocket Communication**: Real-time bidirectional communication using WebSocket protocol
- **Multi-World Support**: Configurable number of game worlds with load balancing
- **Entity System**: Object-oriented entity management (players, mobs, NPCs, items, chests)

## Key Components

### Client-Side Components

1. **Game Engine (`game.js`)**
   - Main game loop and state management
   - Entity management and rendering coordination
   - User input handling and game logic

2. **Renderer (`renderer.js`)**
   - Multi-layer Canvas rendering system
   - Camera system with smooth scrolling
   - Sprite and animation management
   - Mobile/desktop rendering optimization

3. **Networking (`gameclient.js`)**
   - WebSocket connection management
   - Message serialization/deserialization
   - Connection state handling and reconnection logic

4. **Entity System**
   - Base Entity class with position and state management
   - Character class for movable entities (players, mobs)
   - Specialized classes: Player, Mob, NPC, Item, Chest

5. **User Interface**
   - Chat system with real-time messaging
   - Login/character creation interface
   - Audio management with WebAudio API

### Server-Side Components

1. **World Server (`worldserver.js`)**
   - Game world simulation and state management
   - Player session management
   - Real-time message broadcasting

2. **Multi-World Server (`server.js`)**
   - Load balancing across multiple game worlds
   - Configuration management
   - Process lifecycle management

3. **Entity Management**
   - Server-side entity classes mirroring client structure
   - Combat system and damage calculation
   - AI behavior for mobs and NPCs

4. **Persistence Layer**
   - PostgreSQL database with Drizzle ORM for player data persistence
   - User accounts and player profiles with character progression
   - Game sessions tracking and statistics
   - Chat message history and moderation
   - Player inventory and equipment state
   - Fallback to in-memory storage when database unavailable

## Data Flow

### Client-Server Communication
1. **Connection**: Client establishes WebSocket connection to server
2. **Authentication**: Player name validation and character creation
3. **World State Sync**: Server sends initial world state and entity positions
4. **Real-time Updates**: Bidirectional message exchange for:
   - Player movement and actions
   - Entity spawning/despawning
   - Combat events and damage
   - Chat messages
   - Loot collection

### Game Loop Architecture
- **Client**: 60 FPS rendering loop with input handling
- **Server**: Entity update loop with configurable tick rate
- **Synchronization**: Regular state synchronization between client and server

## External Dependencies

### Client Dependencies
- **jQuery 1.9.1**: DOM manipulation and AJAX requests
- **Underscore.js 1.4.4**: Utility functions and data manipulation
- **RequireJS 2.1.9**: AMD module loading system
- **Modernizr 2.6.2**: Feature detection for browser compatibility

### Server Dependencies
- **log ^6.3.2**: Logging system for debugging and monitoring
- **underscore ^1.13.7**: Server-side utility functions
- **ws**: WebSocket server implementation (implied from code)

### Optional External Services
- **Redis**: Player data persistence and session management
- **MySQL**: Game statistics and player progression data
- **Metrics System**: Performance monitoring (configurable)

## Deployment Strategy

### Development Environment
- **Local Configuration**: Uses `config_local.json` for development settings
- **Debug Mode**: Enabled logging and development tools
- **Hot Reload**: Direct file serving for rapid development

### Production Environment
- **Build Configuration**: Uses `config_build.json` for production settings
- **Static Asset Optimization**: Build scripts for client asset bundling
- **Process Management**: Multi-world server deployment with load balancing
- **Performance Monitoring**: Metrics collection and monitoring

### Configuration Management
- **Environment-based Configs**: Separate configurations for local and production
- **Database Settings**: Configurable Redis and MySQL connections
- **Scaling Parameters**: Adjustable player limits and world counts
- **Debug Controls**: Configurable logging levels and debug features

### Security Considerations
- **Input Validation**: Server-side validation of all client inputs
- **Rate Limiting**: Movement and action cooldowns to prevent spam
- **Session Management**: Secure player session handling
- **Connection Security**: WebSocket connection management and validation