import type { Express } from "express";
import { createServer, type Server } from "http";
import WebSocket from "ws";
import { GameServer } from "./gameServer";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize game server with WebSocket support
  const gameServer = new GameServer(httpServer);
  
  // API routes for game management
  app.get("/api/game/stats", (req, res) => {
    const stats = gameServer.getStats();
    res.json(stats);
  });
  
  app.get("/api/game/players", (req, res) => {
    const players = gameServer.getPlayers();
    res.json(players);
  });
  
  app.get("/api/game/gangs", (req, res) => {
    const gangs = gameServer.getGangs();
    res.json(gangs);
  });
  
  app.get("/api/game/leaderboard", (req, res) => {
    const leaderboard = gameServer.getLeaderboard();
    res.json(leaderboard);
  });
  
  app.get("/api/game/map", (req, res) => {
    const currentMap = gameServer.getCurrentMap();
    res.json(currentMap);
  });
  
  app.get("/api/weapons", (req, res) => {
    const weapons = gameServer.getWeapons();
    res.json(weapons);
  });
  
  // Admin routes
  app.post("/api/admin/kick", (req, res) => {
    const { playerId, reason } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }
    
    const success = gameServer.kickPlayer(playerId, reason);
    
    if (success) {
      res.json({ message: "Player kicked successfully" });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });
  
  app.post("/api/admin/ban", (req, res) => {
    const { playerId, reason, duration } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }
    
    const success = gameServer.banPlayer(playerId, reason);
    
    if (success) {
      res.json({ message: "Player banned successfully" });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });
  
  app.post("/api/admin/heal", (req, res) => {
    const { playerId, amount } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }
    
    const success = gameServer.healPlayer(playerId, amount || 100);
    
    if (success) {
      res.json({ message: "Player healed successfully" });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });
  
  app.post("/api/admin/teleport", (req, res) => {
    const { playerId, x, y } = req.body;
    
    if (!playerId || typeof x !== 'number' || typeof y !== 'number') {
      return res.status(400).json({ error: "Player ID and coordinates are required" });
    }
    
    const success = gameServer.teleportPlayer(playerId, x, y);
    
    if (success) {
      res.json({ message: "Player teleported successfully" });
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });
  
  app.get("/api/admin/logs", (req, res) => {
    const logs = gameServer.getLogs();
    res.json(logs);
  });
  
  // Map editor routes
  app.post("/api/map/save", (req, res) => {
    const { mapData } = req.body;
    
    if (!mapData) {
      return res.status(400).json({ error: "Map data is required" });
    }
    
    const result = gameServer.saveMap(mapData);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  });
  
  app.get("/api/map/load/:mapId", (req, res) => {
    const { mapId } = req.params;
    const map = gameServer.getMap(mapId);
    
    if (map) {
      res.json(map);
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  });
  
  app.get("/api/maps", (req, res) => {
    const maps = gameServer.getAllMaps();
    res.json(maps);
  });
  
  // Gang management routes
  app.post("/api/gang/create", (req, res) => {
    const { name, leaderId, color } = req.body;
    
    if (!name || !leaderId) {
      return res.status(400).json({ error: "Gang name and leader ID are required" });
    }
    
    const gang = gameServer.createGang({ name, leaderId, color });
    
    if (gang) {
      res.json(gang);
    } else {
      res.status(400).json({ error: "Failed to create gang" });
    }
  });
  
  app.post("/api/gang/join", (req, res) => {
    const { gangId, playerId } = req.body;
    
    if (!gangId || !playerId) {
      return res.status(400).json({ error: "Gang ID and player ID are required" });
    }
    
    const success = gameServer.joinGang(gangId, playerId);
    
    if (success) {
      res.json({ message: "Player joined gang successfully" });
    } else {
      res.status(400).json({ error: "Failed to join gang" });
    }
  });
  
  app.post("/api/gang/leave", (req, res) => {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }
    
    const success = gameServer.leaveGang(playerId);
    
    if (success) {
      res.json({ message: "Player left gang successfully" });
    } else {
      res.status(400).json({ error: "Failed to leave gang" });
    }
  });
  
  // Server management routes
  app.post("/api/server/restart", (req, res) => {
    gameServer.restart();
    res.json({ message: "Server restart initiated" });
  });
  
  app.get("/api/server/status", (req, res) => {
    const status = gameServer.getServerStatus();
    res.json(status);
  });
  
  app.post("/api/server/settings", (req, res) => {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: "Settings are required" });
    }
    
    const success = gameServer.updateSettings(settings);
    
    if (success) {
      res.json({ message: "Settings updated successfully" });
    } else {
      res.status(400).json({ error: "Failed to update settings" });
    }
  });
  
  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return httpServer;
}
