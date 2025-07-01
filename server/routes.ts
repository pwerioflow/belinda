import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChildSchema, insertActivitySchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import MemoryStore from "memorystore";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  const MemStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "mundo-divertido-secret",
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      req.session.userId = user.id;
      req.session.isParent = user.isParent;
      
      res.json({ user: { id: user.id, email: user.email, isParent: user.isParent } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Guest login
  app.post("/api/guest-login", async (req, res) => {
    try {
      req.session.userId = 0; // Special guest user ID
      req.session.isParent = false;
      req.session.isGuest = true;
      
      res.json({ user: { id: 0, email: "guest", isParent: false, isGuest: true } });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Register
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.isParent = user.isParent;
      
      res.json({ user: { id: user.id, email: user.email, isParent: user.isParent } });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Get current user
  app.get("/api/user", (req: any, res) => {
    if (req.session.isGuest) {
      return res.json({ 
        user: { id: 0, email: "guest", isParent: false, isGuest: true }
      });
    }
    
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ 
      user: { 
        id: req.session.userId, 
        isParent: req.session.isParent,
        isGuest: false
      }
    });
  });

  // Child routes
  app.get("/api/child", async (req: any, res) => {
    try {
      if (req.session.isGuest) {
        // Return default guest child
        return res.json({
          id: 0,
          name: "Visitante",
          avatar: "heart",
          timeLimit: 30,
        });
      }

      const child = await storage.getChildByParentId(req.session.userId);
      if (!child) {
        return res.status(404).json({ message: "Criança não encontrada" });
      }
      
      res.json(child);
    } catch (error) {
      console.error("Get child error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/child", requireAuth, async (req: any, res) => {
    try {
      const childData = insertChildSchema.parse(req.body);
      const child = await storage.createChild({
        ...childData,
        parentId: req.session.userId,
      });
      
      res.json(child);
    } catch (error) {
      console.error("Create child error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/child/:id", requireAuth, async (req: any, res) => {
    try {
      const childId = parseInt(req.params.id);
      const updates = insertChildSchema.partial().parse(req.body);
      
      const child = await storage.updateChild(childId, updates);
      res.json(child);
    } catch (error) {
      console.error("Update child error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Activity tracking
  app.post("/api/activity", async (req: any, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      
      res.json(activity);
    } catch (error) {
      console.error("Create activity error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/activities/:childId/:date", async (req, res) => {
    try {
      const childId = parseInt(req.params.childId);
      const date = req.params.date;
      
      const activities = await storage.getActivitiesByChildAndDate(childId, date);
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Content routes
  app.get("/api/photos", async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      console.error("Get photos error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/songs", async (req, res) => {
    try {
      const songs = await storage.getAllSongs();
      res.json(songs);
    } catch (error) {
      console.error("Get songs error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
